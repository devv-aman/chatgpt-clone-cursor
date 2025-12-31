import { create } from "zustand";
import { chatApi } from "@/api";
import { getRoutePath } from "@/constants/routes";
import type {
  Message,
  ChatStatus,
  StreamEvent,
  ChatWithStatus,
  TokenUsage,
} from "@/types/chat";

// Per-chat state
interface ChatSessionState {
  messages: Message[];
  currentResponse: string;
  status: ChatStatus;
  streamId: string | null;
  error: string | null;
  tokensUsed: TokenUsage | null;
  abortController: AbortController | null;
}

// Global store state
interface ChatStore {
  // Map of chat states by chatId
  chats: Map<string, ChatSessionState>;
  // Currently active chat ID
  activeChatId: string | null;
  // Chat list for sidebar (with streaming status)
  chatList: ChatWithStatus[];
  chatListTotal: number;
  chatListLoading: boolean;
  // Pending message for new chats (before we get the chatId from server)
  pendingMessage: string | null;

  // Actions
  setActiveChat: (chatId: string | null) => void;
  clearActiveChat: () => void;
  loadChatMessages: (chatId: string) => Promise<void>;
  sendMessage: (
    content: string,
    model: string,
    navigate: (path: string, options?: { replace?: boolean }) => void
  ) => Promise<void>;
  stopStream: (chatId: string) => Promise<void>;
  appendContent: (chatId: string, delta: string) => void;
  loadChatList: (append?: boolean) => Promise<void>;
  addChatToList: (chat: ChatWithStatus) => void;
  updateChatInList: (chatId: string, updates: Partial<ChatWithStatus>) => void;

  // Selectors
  getChatState: (chatId: string | null) => ChatSessionState | null;
  getActiveChat: () => ChatSessionState | null;
}

const initialChatSessionState: ChatSessionState = {
  messages: [],
  currentResponse: "",
  status: "idle",
  streamId: null,
  error: null,
  tokensUsed: null,
  abortController: null,
};

const CHATS_PER_PAGE = 20;

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: new Map(),
  activeChatId: null,
  chatList: [],
  chatListTotal: 0,
  chatListLoading: false,
  pendingMessage: null,

  setActiveChat: (chatId) => {
    set({ activeChatId: chatId });
  },

  clearActiveChat: () => {
    const { activeChatId, chats } = get();

    // Abort any ongoing stream for the active chat
    if (activeChatId) {
      const chatState = chats.get(activeChatId);
      if (chatState?.abortController) {
        chatState.abortController.abort();
      }
    }

    set({ activeChatId: null, pendingMessage: null });
  },

  loadChatMessages: async (chatId) => {
    const { chats } = get();
    const existingState = chats.get(chatId);

    // Don't load if already streaming or loading
    if (
      existingState?.status === "streaming" ||
      existingState?.status === "loading"
    ) {
      return;
    }

    // Set loading state before fetching
    const newChats = new Map(chats);
    newChats.set(chatId, {
      ...initialChatSessionState,
      status: "loading",
    });
    set({ chats: newChats });

    try {
      const response = await chatApi.getChatMessages(chatId);
      if (response.success) {
        const { chats: currentChats } = get();
        const updatedChats = new Map(currentChats);
        updatedChats.set(chatId, {
          ...initialChatSessionState,
          messages: response.data.messages,
          status: "idle",
        });
        set({ chats: updatedChats });
      }
    } catch (error) {
      const { chats: currentChats } = get();
      const updatedChats = new Map(currentChats);
      updatedChats.set(chatId, {
        ...initialChatSessionState,
        error: (error as Error).message,
        status: "error",
      });
      set({ chats: updatedChats });
    }
  },

  sendMessage: async (content, model, navigate) => {
    const { chats, activeChatId, chatList } = get();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const existingState = activeChatId ? chats.get(activeChatId) : null;
    if (existingState?.status === "streaming") return;

    // Create user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: activeChatId || "",
      role: "user",
      content: trimmedContent,
      model_id: null,
      model_name: null,
      tokens_used: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    // Create abort controller
    const abortController = new AbortController();

    // Determine the chatId to use (existing or will be assigned by server)
    const targetChatId = activeChatId || `temp-${Date.now()}`;
    const isNewChat = !activeChatId;

    // Update state with user message and start streaming
    const newChats = new Map(chats);
    newChats.set(targetChatId, {
      messages: [...(existingState?.messages || []), userMessage],
      currentResponse: "",
      status: "streaming",
      streamId: null,
      error: null,
      tokensUsed: null,
      abortController,
    });

    // If it's a new chat, optimistically add to chat list
    let newChatList = chatList;
    if (isNewChat) {
      const optimisticChat: ChatWithStatus = {
        id: targetChatId,
        user_id: "",
        title:
          trimmedContent.slice(0, 50) +
          (trimmedContent.length > 50 ? "..." : ""),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        isStreaming: true,
      };
      newChatList = [optimisticChat, ...chatList];
    }

    set({
      chats: newChats,
      activeChatId: targetChatId,
      chatList: newChatList,
      pendingMessage: isNewChat ? trimmedContent : null,
    });

    // Event handler for stream events
    const handleEvent = (event: StreamEvent) => {
      const {
        chats: currentChats,
        chatList: currentChatList,
        activeChatId: currentActiveId,
      } = get();

      switch (event.type) {
        case "session": {
          // Server assigned the real chatId
          const realChatId = event.chatId;
          const newChatsMap = new Map(currentChats);

          // Move state from temp ID to real ID
          const tempState = newChatsMap.get(targetChatId);
          if (tempState) {
            // Update chat_id in messages
            const updatedMessages = tempState.messages.map((msg) => ({
              ...msg,
              chat_id: realChatId,
            }));

            newChatsMap.delete(targetChatId);
            newChatsMap.set(realChatId, {
              ...tempState,
              streamId: event.streamId,
              messages: updatedMessages,
            });
          }

          // Update chat list - replace temp with real
          const updatedChatList = currentChatList.map((chat) =>
            chat.id === targetChatId ? { ...chat, id: realChatId } : chat
          );

          set({
            chats: newChatsMap,
            activeChatId: realChatId,
            chatList: updatedChatList,
          });

          // Navigate to real chat URL
          if (isNewChat) {
            navigate(getRoutePath.chat(realChatId), { replace: true });
          }
          break;
        }

        case "content": {
          const chatId = currentActiveId || targetChatId;
          const currentState = currentChats.get(chatId);
          if (currentState) {
            const newChatsMap = new Map(currentChats);
            newChatsMap.set(chatId, {
              ...currentState,
              currentResponse: currentState.currentResponse + event.delta,
            });
            set({ chats: newChatsMap });
          }
          break;
        }

        case "done": {
          const chatId = currentActiveId || targetChatId;
          const currentState = currentChats.get(chatId);
          if (currentState) {
            // Create assistant message with token usage
            const assistantMessage: Message = {
              id: event.messageId,
              chat_id: chatId,
              role: "assistant",
              content: currentState.currentResponse,
              model_id: model,
              model_name: model,
              tokens_used: event.usage?.total_tokens ?? null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            };

            const newChatsMap = new Map(currentChats);
            newChatsMap.set(chatId, {
              ...currentState,
              messages: [...currentState.messages, assistantMessage],
              currentResponse: "",
              status: "idle",
              streamId: null,
              tokensUsed: event.usage ?? null,
              abortController: null,
            });

            // Update chat list to remove streaming flag
            const updatedChatList = currentChatList.map((chat) =>
              chat.id === chatId ? { ...chat, isStreaming: false } : chat
            );

            set({
              chats: newChatsMap,
              chatList: updatedChatList,
              pendingMessage: null,
            });
          }
          break;
        }

        case "error": {
          const chatId = currentActiveId || targetChatId;
          const currentState = currentChats.get(chatId);
          if (currentState) {
            const newChatsMap = new Map(currentChats);
            newChatsMap.set(chatId, {
              ...currentState,
              status: "error",
              error: event.message,
              streamId: null,
              abortController: null,
            });

            // Update chat list to remove streaming flag
            const updatedChatList = currentChatList.map((chat) =>
              chat.id === chatId ? { ...chat, isStreaming: false } : chat
            );

            set({
              chats: newChatsMap,
              chatList: updatedChatList,
            });
          }
          break;
        }
      }
    };

    try {
      // Generate title from first message for new chats
      const title = isNewChat
        ? trimmedContent.slice(0, 50) +
          (trimmedContent.length > 50 ? "..." : "")
        : undefined;

      await chatApi.startStream(
        {
          message: trimmedContent,
          model,
          chatId: activeChatId || undefined,
          title,
        },
        handleEvent,
        abortController.signal
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        const { chats: currentChats, activeChatId: currentActiveId } = get();
        const chatId = currentActiveId || targetChatId;
        const currentState = currentChats.get(chatId);

        if (currentState) {
          const newChatsMap = new Map(currentChats);
          newChatsMap.set(chatId, {
            ...currentState,
            status: "error",
            error: (error as Error).message,
            streamId: null,
            abortController: null,
          });
          set({ chats: newChatsMap });
        }
      }
    }
  },

  stopStream: async (chatId) => {
    const { chats, chatList } = get();
    const chatState = chats.get(chatId);

    if (!chatState) return;

    // Abort the fetch request
    chatState.abortController?.abort();

    // Try to stop on server
    if (chatState.streamId) {
      try {
        await chatApi.stopStream(chatState.streamId);
      } catch {
        // Ignore errors when stopping
      }
    }

    // Create assistant message from partial response if any
    const newChats = new Map(chats);
    if (chatState.currentResponse) {
      const assistantMessage: Message = {
        id: `stopped-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: chatState.currentResponse,
        model_id: null,
        model_name: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      newChats.set(chatId, {
        ...chatState,
        messages: [...chatState.messages, assistantMessage],
        currentResponse: "",
        status: "stopped",
        streamId: null,
        abortController: null,
      });
    } else {
      newChats.set(chatId, {
        ...chatState,
        status: "stopped",
        streamId: null,
        abortController: null,
      });
    }

    // Update chat list to remove streaming flag
    const updatedChatList = chatList.map((chat) =>
      chat.id === chatId ? { ...chat, isStreaming: false } : chat
    );

    set({ chats: newChats, chatList: updatedChatList });
  },

  appendContent: (chatId, delta) => {
    const { chats } = get();
    const chatState = chats.get(chatId);

    if (chatState) {
      const newChats = new Map(chats);
      newChats.set(chatId, {
        ...chatState,
        currentResponse: chatState.currentResponse + delta,
      });
      set({ chats: newChats });
    }
  },

  loadChatList: async (append = false) => {
    const { chatList, chatListLoading } = get();

    if (chatListLoading) return;

    set({ chatListLoading: true });

    const offset = append ? chatList.length : 0;

    try {
      const response = await chatApi.getChats(CHATS_PER_PAGE, offset);
      if (response.success) {
        const newChats = response.data.chats.map((chat) => ({
          ...chat,
          isStreaming: false,
        }));

        set({
          chatList: append ? [...chatList, ...newChats] : newChats,
          chatListTotal: response.data.total,
          chatListLoading: false,
        });
      }
    } catch {
      set({ chatListLoading: false });
    }
  },

  addChatToList: (chat) => {
    const { chatList } = get();
    set({ chatList: [chat, ...chatList] });
  },

  updateChatInList: (chatId, updates) => {
    const { chatList } = get();
    const updatedList = chatList.map((chat) =>
      chat.id === chatId ? { ...chat, ...updates } : chat
    );
    set({ chatList: updatedList });
  },

  getChatState: (chatId) => {
    if (!chatId) return null;
    return get().chats.get(chatId) || null;
  },

  getActiveChat: () => {
    const { activeChatId, chats } = get();
    if (!activeChatId) return null;
    return chats.get(activeChatId) || null;
  },
}));

// Helper hook for getting active chat state
export const useActiveChatState = () => {
  return useChatStore((state) => {
    const { activeChatId, chats } = state;
    if (!activeChatId) return null;
    return chats.get(activeChatId) || null;
  });
};

// Helper hook for chat list with streaming status
export const useChatList = () => {
  return useChatStore((state) => ({
    chats: state.chatList,
    total: state.chatListTotal,
    isLoading: state.chatListLoading,
    loadMore: () => state.loadChatList(true),
    refresh: () => state.loadChatList(false),
  }));
};
