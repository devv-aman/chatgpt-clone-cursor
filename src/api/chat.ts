import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';
import type {
  ChatListResponse,
  ChatResponse,
  MessagesResponse,
  StartStreamRequest,
  StreamEvent,
} from '@/types/chat';

type StreamCallback = (event: StreamEvent) => void;

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const chatApi = {
  /**
   * Start a chat stream using SSE
   * @param request - The stream request containing message, optional model and chatId
   * @param onEvent - Callback for each stream event
   * @param signal - AbortSignal for cancellation
   */
  async startStream(
    request: StartStreamRequest,
    onEvent: StreamCallback,
    signal?: AbortSignal
  ): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      onEvent({ type: 'error', message: 'Not authenticated' });
      return;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.STREAM}`,
      {
        method: 'POST',
        headers: {
          [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.CONTENT_TYPES.JSON,
          [API_CONFIG.HEADERS.AUTHORIZATION]: `Bearer ${token}`,
          [API_CONFIG.HEADERS.ACCEPT]: API_CONFIG.CONTENT_TYPES.EVENT_STREAM,
        },
        body: JSON.stringify(request),
        signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onEvent({
        type: 'error',
        message: errorData?.error?.message || `HTTP error ${response.status}`,
      });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onEvent({ type: 'error', message: 'No response body' });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6)) as StreamEvent;
              onEvent(eventData);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        try {
          const eventData = JSON.parse(buffer.slice(6)) as StreamEvent;
          onEvent(eventData);
        } catch {
          // Skip malformed JSON
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Stream was aborted intentionally
        return;
      }
      onEvent({
        type: 'error',
        message: (error as Error).message || 'Stream error',
      });
    }
  },

  /**
   * Stop an active stream
   * @param streamId - The stream ID to stop
   */
  async stopStream(streamId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.CHAT.STOP_STREAM(streamId)
    );
    return response.data;
  },

  /**
   * Get list of user's chats with pagination
   * @param limit - Number of chats to return (default 20, max 100)
   * @param offset - Number of chats to skip
   */
  async getChats(limit = 20, offset = 0): Promise<ChatListResponse> {
    const response = await apiClient.get<ChatListResponse>(
      API_ENDPOINTS.CHAT.LIST,
      { params: { limit, offset } }
    );
    return response.data;
  },

  /**
   * Get a single chat by ID
   * @param chatId - The chat ID
   */
  async getChat(chatId: string): Promise<ChatResponse> {
    const response = await apiClient.get<ChatResponse>(
      API_ENDPOINTS.CHAT.DETAIL(chatId)
    );
    return response.data;
  },

  /**
   * Get messages for a chat with pagination
   * @param chatId - The chat ID
   * @param limit - Number of messages to return (default 50, max 100)
   * @param offset - Number of messages to skip
   */
  async getChatMessages(
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<MessagesResponse> {
    const response = await apiClient.get<MessagesResponse>(
      API_ENDPOINTS.CHAT.MESSAGES(chatId),
      { params: { limit, offset } }
    );
    return response.data;
  },
};

