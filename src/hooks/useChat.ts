import { useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi } from '@/api';
import { getRoutePath } from '@/constants/routes';
import type { Message, ChatState, StreamEvent } from '@/types/chat';
import { CHAT_CONFIG } from '@/pages/Chat/constants';

const initialState: ChatState = {
  chatId: null,
  streamId: null,
  messages: [],
  currentResponse: '',
  status: 'idle',
  error: null,
  tokensUsed: null,
};

export function useChat() {
  const navigate = useNavigate();
  const { chatId: urlChatId } = useParams<{ chatId: string }>();
  
  const [state, setState] = useState<ChatState>(() => ({
    ...initialState,
    chatId: urlChatId || null,
  }));
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      const response = await chatApi.getChatMessages(chatId);
      if (response.success) {
        updateState({
          chatId,
          messages: response.data.messages,
          status: 'idle',
        });
      }
    } catch (error) {
      updateState({
        error: (error as Error).message,
        status: 'error',
      });
    }
  }, [updateState]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.status === 'streaming') return;

      // Create user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: state.chatId || '',
        role: 'user',
        content: content.trim(),
        model_id: null,
        model_name: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      // Update state with user message and start streaming
      updateState({
        messages: [...state.messages, userMessage],
        currentResponse: '',
        status: 'streaming',
        error: null,
        tokensUsed: null,
      });

      // Create abort controller for this stream
      abortControllerRef.current = new AbortController();

      const handleEvent = (event: StreamEvent) => {
        switch (event.type) {
          case 'session':
            // Update chatId and navigate to chat URL
            updateState({ 
              chatId: event.chatId, 
              streamId: event.streamId 
            });
            if (!urlChatId) {
              navigate(getRoutePath.chat(event.chatId), { replace: true });
            }
            break;

          case 'content':
            setState((prev) => ({
              ...prev,
              currentResponse: prev.currentResponse + event.delta,
            }));
            break;

          case 'done':
            setState((prev) => {
              // Create assistant message from accumulated response
              const assistantMessage: Message = {
                id: event.messageId,
                chat_id: prev.chatId || '',
                role: 'assistant',
                content: prev.currentResponse,
                model_id: CHAT_CONFIG.DEFAULT_MODEL,
                model_name: CHAT_CONFIG.DEFAULT_MODEL,
                tokens_used: prev.tokensUsed,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
              };

              return {
                ...prev,
                messages: [...prev.messages, assistantMessage],
                currentResponse: '',
                status: 'idle',
                streamId: null,
              };
            });
            break;

          case 'error':
            updateState({
              status: 'error',
              error: event.message,
              streamId: null,
            });
            break;
        }
      };

      try {
        await chatApi.startStream(
          {
            message: content.trim(),
            model: CHAT_CONFIG.DEFAULT_MODEL,
            chatId: state.chatId || undefined,
          },
          handleEvent,
          abortControllerRef.current.signal
        );
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          updateState({
            status: 'error',
            error: (error as Error).message,
            streamId: null,
          });
        }
      }
    },
    [state.chatId, state.messages, state.status, updateState, navigate, urlChatId]
  );

  const stopStream = useCallback(async () => {
    if (state.streamId) {
      try {
        await chatApi.stopStream(state.streamId);
      } catch {
        // Ignore errors when stopping
      }
    }
    
    // Abort the fetch request
    abortControllerRef.current?.abort();
    
    // Create assistant message from partial response
    if (state.currentResponse) {
      setState((prev) => {
        const assistantMessage: Message = {
          id: `stopped-${Date.now()}`,
          chat_id: prev.chatId || '',
          role: 'assistant',
          content: prev.currentResponse,
          model_id: CHAT_CONFIG.DEFAULT_MODEL,
          model_name: CHAT_CONFIG.DEFAULT_MODEL,
          tokens_used: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        };

        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          currentResponse: '',
          status: 'stopped',
          streamId: null,
        };
      });
    } else {
      updateState({
        status: 'stopped',
        streamId: null,
      });
    }
  }, [state.streamId, state.currentResponse, updateState]);

  const startNewChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(initialState);
    navigate(getRoutePath.chat(), { replace: true });
  }, [navigate]);

  return {
    ...state,
    sendMessage,
    stopStream,
    startNewChat,
    loadChatMessages,
    isStreaming: state.status === 'streaming',
  };
}

