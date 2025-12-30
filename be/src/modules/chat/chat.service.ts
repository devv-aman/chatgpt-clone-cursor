import OpenAI from "openai";
import { getSupabaseAdminClient } from "../../db/client.js";
import { settingsService } from "../settings/index.js";
import { streamService, STREAM_CONSTANTS } from "../stream/index.js";
import { NotFoundError, InternalServerError } from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/errors.js";
import { MESSAGE_ROLES } from "../../constants/strings.js";
import { logger } from "../../utils/logger.js";
import { CHAT_CONSTANTS } from "./chat.constants.js";
import type {
  StreamChatInput,
  MessagesResponse,
  ChatsResponse,
  SSEEvent,
  Usage,
  MessageWithUsage,
} from "./chat.schema.js";
import type { Message, Chat, MessageInsert } from "../../db/types.js";

interface StreamContext {
  chatId: string;
  streamId: string;
  userId: string;
  model: string;
  abortController: AbortController;
}

const createOpenAIClient = (apiKey: string): OpenAI => {
  return new OpenAI({ apiKey });
};

export const createChatSession = async (
  userId: string,
  title?: string
): Promise<Chat> => {
  const adminClient = getSupabaseAdminClient();

  const { data, error } = await adminClient
    .from("chats")
    .insert({
      user_id: userId,
      title: title || CHAT_CONSTANTS.DEFAULT_TITLE,
    })
    .select()
    .single();

  if (error || !data) {
    logger.error({ error, userId }, "Failed to create chat session");
    throw new InternalServerError(ERROR_MESSAGES.CHAT.CREATE_FAILED);
  }

  return data;
};

export const getChatSession = async (
  chatId: string,
  userId: string
): Promise<Chat> => {
  const adminClient = getSupabaseAdminClient();

  const { data, error } = await adminClient
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    throw new NotFoundError(ERROR_MESSAGES.CHAT.NOT_FOUND);
  }

  return data;
};

export const saveMessage = async (
  chatId: string,
  role: string,
  content: string,
  modelId?: string | null,
  modelName?: string | null,
  usage?: Usage | null
): Promise<Message> => {
  const adminClient = getSupabaseAdminClient();

  const messageData: MessageInsert = {
    chat_id: chatId,
    role: role as Message["role"],
    content,
    model_id: modelId ?? null,
    model_name: modelName ?? null,
    prompt_tokens: usage?.prompt_tokens ?? null,
    completion_tokens: usage?.completion_tokens ?? null,
    tokens_used: usage?.total_tokens ?? null,
  };

  const { data, error } = await adminClient
    .from("messages")
    .insert(messageData)
    .select()
    .single();

  if (error || !data) {
    logger.error({ error, chatId }, "Failed to save message");
    throw new InternalServerError(ERROR_MESSAGES.MESSAGE.CREATE_FAILED);
  }

  return data;
};

// Transform a database message to include usage object
const transformMessageWithUsage = (message: Message): MessageWithUsage => {
  const { prompt_tokens, completion_tokens, tokens_used, ...rest } = message;

  // Only include usage if we have token data
  const hasUsage =
    prompt_tokens !== null ||
    completion_tokens !== null ||
    tokens_used !== null;

  return {
    ...rest,
    usage: hasUsage
      ? {
          prompt_tokens: prompt_tokens ?? 0,
          completion_tokens: completion_tokens ?? 0,
          total_tokens:
            tokens_used ?? (prompt_tokens ?? 0) + (completion_tokens ?? 0),
        }
      : null,
  };
};

export const getMessagesForChat = async (
  chatId: string,
  userId: string,
  limit: number = CHAT_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<MessagesResponse> => {
  const adminClient = getSupabaseAdminClient();

  // Verify chat ownership
  await getChatSession(chatId, userId);

  // Get total count
  const { count, error: countError } = await adminClient
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("chat_id", chatId)
    .is("deleted_at", null);

  if (countError) {
    logger.error({ error: countError, chatId }, "Failed to count messages");
    throw new InternalServerError(ERROR_MESSAGES.SERVER.DATABASE_ERROR);
  }

  // Get messages
  const { data, error } = await adminClient
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error({ error, chatId }, "Failed to fetch messages");
    throw new InternalServerError(ERROR_MESSAGES.SERVER.DATABASE_ERROR);
  }

  // Transform messages to include usage object
  const messagesWithUsage = (data || []).map(transformMessageWithUsage);

  return {
    messages: messagesWithUsage,
    total: count || 0,
  };
};

export const getUserChats = async (
  userId: string,
  limit: number = CHAT_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<ChatsResponse> => {
  const adminClient = getSupabaseAdminClient();

  // Get total count
  const { count, error: countError } = await adminClient
    .from("chats")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (countError) {
    logger.error({ error: countError, userId }, "Failed to count chats");
    throw new InternalServerError(ERROR_MESSAGES.SERVER.DATABASE_ERROR);
  }

  // Get chats
  const { data, error } = await adminClient
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error({ error, userId }, "Failed to fetch chats");
    throw new InternalServerError(ERROR_MESSAGES.SERVER.DATABASE_ERROR);
  }

  // Get total tokens for each chat
  const chatIds = (data || []).map((chat) => chat.id);

  let tokensByChat: Record<string, number> = {};

  if (chatIds.length > 0) {
    // Aggregate tokens_used for each chat
    const { data: tokenData, error: tokenError } = await adminClient
      .from("messages")
      .select("chat_id, tokens_used")
      .in("chat_id", chatIds)
      .is("deleted_at", null);

    if (!tokenError && tokenData) {
      tokensByChat = tokenData.reduce((acc, msg) => {
        if (msg.tokens_used) {
          acc[msg.chat_id] = (acc[msg.chat_id] || 0) + msg.tokens_used;
        }
        return acc;
      }, {} as Record<string, number>);
    }
  }

  // Attach total_tokens to each chat
  const chatsWithTokens = (data || []).map((chat) => ({
    ...chat,
    total_tokens: tokensByChat[chat.id] || 0,
  }));

  return {
    chats: chatsWithTokens,
    total: count || 0,
  };
};

export const streamChat = async (
  userId: string,
  input: StreamChatInput,
  sendEvent: (event: SSEEvent) => void,
  onComplete: () => void
): Promise<void> => {
  // Get user's OpenAI API key
  const apiKey = await settingsService.requireOpenAIKey(userId);
  const openai = createOpenAIClient(apiKey);

  // Create or get chat session
  let chatId = input.chatId;
  if (!chatId) {
    const chat = await createChatSession(userId, input.title);
    chatId = chat.id;
  } else {
    // Verify ownership
    await getChatSession(chatId, userId);
  }

  // Create stream tracking
  const { streamId, abortController } = await streamService.createStream(
    chatId,
    userId
  );

  // Send session event first
  sendEvent({
    type: CHAT_CONSTANTS.SSE.EVENT_TYPES.SESSION,
    chatId,
    streamId,
  });

  // Save user message immediately
  await saveMessage(chatId, MESSAGE_ROLES.USER, input.message);

  // Start background streaming process
  streamInBackground(
    {
      chatId,
      streamId,
      userId,
      model: input.model || CHAT_CONSTANTS.DEFAULT_MODEL,
      abortController,
    },
    openai,
    input.message,
    sendEvent,
    onComplete
  );
};

const streamInBackground = async (
  context: StreamContext,
  openai: OpenAI,
  _userMessage: string,
  sendEvent: (event: SSEEvent) => void,
  onComplete: () => void
): Promise<void> => {
  const { chatId, streamId, model, abortController } = context;
  let accumulatedContent = "";
  let tokenUsage: Usage | null = null;

  try {
    // Fetch previous messages for context
    const adminClient = getSupabaseAdminClient();
    const { data: previousMessages } = await adminClient
      .from("messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages: OpenAI.ChatCompletionMessageParam[] = (
      previousMessages || []
    ).map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // Start OpenAI stream with usage tracking enabled
    const stream = await openai.chat.completions.create(
      {
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
      },
      {
        signal: abortController.signal,
      }
    );

    for await (const chunk of stream) {
      // Check if stream was aborted
      if (abortController.signal.aborted) {
        logger.info({ streamId }, "Stream aborted by user");
        break;
      }

      // Capture usage from the final chunk (it has usage but no content)
      if (chunk.usage) {
        tokenUsage = {
          prompt_tokens: chunk.usage.prompt_tokens,
          completion_tokens: chunk.usage.completion_tokens,
          total_tokens: chunk.usage.total_tokens,
        };
        logger.info({ streamId, usage: tokenUsage }, "Token usage captured");
      }

      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        accumulatedContent += delta;
        sendEvent({
          type: CHAT_CONSTANTS.SSE.EVENT_TYPES.CONTENT,
          delta,
        });
      }
    }

    // Save the complete assistant message with token usage
    if (accumulatedContent) {
      const savedMessage = await saveMessage(
        chatId,
        MESSAGE_ROLES.ASSISTANT,
        accumulatedContent,
        model,
        model,
        tokenUsage
      );

      // Update stream status
      await streamService.updateStreamStatus(
        streamId,
        STREAM_CONSTANTS.STATUS.COMPLETED
      );

      const doneEvent: SSEEvent = {
        type: CHAT_CONSTANTS.SSE.EVENT_TYPES.DONE,
        messageId: savedMessage.id,
        ...(tokenUsage && { usage: tokenUsage }),
      };
      sendEvent(doneEvent);
    }
  } catch (error) {
    // Handle abort error gracefully
    if (error instanceof Error && error.name === "AbortError") {
      logger.info({ streamId }, "Stream aborted");

      // Still save partial content if any
      if (accumulatedContent) {
        await saveMessage(
          chatId,
          MESSAGE_ROLES.ASSISTANT,
          accumulatedContent,
          model,
          model,
          tokenUsage
        );
      }

      await streamService.updateStreamStatus(
        streamId,
        STREAM_CONSTANTS.STATUS.STOPPED
      );
    } else {
      logger.error({ error, streamId, chatId }, "OpenAI streaming error");
      await streamService.updateStreamStatus(
        streamId,
        STREAM_CONSTANTS.STATUS.ERROR
      );

      sendEvent({
        type: CHAT_CONSTANTS.SSE.EVENT_TYPES.ERROR,
        message: ERROR_MESSAGES.STREAM.OPENAI_ERROR,
      });
    }
  } finally {
    // Cleanup stream after a delay (allow client to receive final events)
    setTimeout(() => {
      streamService.cleanupStream(streamId);
    }, 5000);

    onComplete();
  }
};

export const stopChatStream = async (
  streamId: string,
  userId: string
): Promise<void> => {
  await streamService.stopStream(streamId, userId);
};

export const chatService = {
  createChatSession,
  getChatSession,
  saveMessage,
  getMessagesForChat,
  getUserChats,
  streamChat,
  stopChatStream,
};
