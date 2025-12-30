/**
 * @deprecated This hook is deprecated. Use useChatStore from @/stores directly.
 *
 * This hook is kept for backwards compatibility but all components should
 * migrate to using the Zustand store directly via:
 *
 * import { useChatStore } from "@/stores";
 */
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "@/stores";
import { useModel } from "@/providers/ModelProvider";
import type { ChatState } from "@/types/chat";

const emptyState: ChatState = {
  chatId: null,
  streamId: null,
  messages: [],
  currentResponse: "",
  status: "idle",
  error: null,
  tokensUsed: null,
};

/**
 * @deprecated Use useChatStore from @/stores directly.
 */
export function useChat() {
  const navigate = useNavigate();
  const { chatId: urlChatId } = useParams<{ chatId: string }>();
  const { model } = useModel();

  // Zustand store selectors
  const activeChatId = useChatStore((state) => state.activeChatId);
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const loadChatMessagesAction = useChatStore(
    (state) => state.loadChatMessages
  );
  const sendMessageAction = useChatStore((state) => state.sendMessage);
  const stopStreamAction = useChatStore((state) => state.stopStream);
  const clearActiveChat = useChatStore((state) => state.clearActiveChat);

  // Get current chat state
  const chatState = useMemo(() => {
    const id = activeChatId || urlChatId;
    if (!id) return emptyState;
    const state = chats.get(id);
    return state
      ? {
          chatId: id,
          streamId: state.streamId,
          messages: state.messages,
          currentResponse: state.currentResponse,
          status: state.status,
          error: state.error,
          tokensUsed: state.tokensUsed?.total_tokens ?? null,
        }
      : emptyState;
  }, [activeChatId, urlChatId, chats]);

  const loadChatMessages = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      loadChatMessagesAction(chatId);
    },
    [setActiveChat, loadChatMessagesAction]
  );

  const sendMessage = useCallback(
    (content: string) => {
      sendMessageAction(content, model, navigate);
    },
    [model, navigate, sendMessageAction]
  );

  const stopStream = useCallback(() => {
    const chatId = activeChatId || urlChatId;
    if (chatId) {
      stopStreamAction(chatId);
    }
  }, [activeChatId, urlChatId, stopStreamAction]);

  const startNewChat = useCallback(() => {
    clearActiveChat();
    navigate("/chat");
  }, [clearActiveChat, navigate]);

  return {
    ...chatState,
    sendMessage,
    stopStream,
    startNewChat,
    loadChatMessages,
    isStreaming: chatState.status === "streaming",
  };
}
