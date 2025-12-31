export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChatWithStatus extends Chat {
  isStreaming?: boolean;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  model_id: string | null;
  model_name: string | null;
  tokens_used: number | null;
  usage?: TokenUsage | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChatListResponse {
  success: boolean;
  message: string;
  data: {
    chats: Chat[];
    total: number;
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: Chat;
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    total: number;
  };
}

export interface StreamSessionEvent {
  type: "session";
  chatId: string;
  streamId: string;
}

export interface StreamContentEvent {
  type: "content";
  delta: string;
}

export interface StreamDoneEvent {
  type: "done";
  messageId: string;
  usage?: TokenUsage;
}

export interface StreamErrorEvent {
  type: "error";
  message: string;
}

export type StreamEvent =
  | StreamSessionEvent
  | StreamContentEvent
  | StreamDoneEvent
  | StreamErrorEvent;

export interface StartStreamRequest {
  message: string;
  model?: string;
  chatId?: string;
  title?: string;
}

export type ChatStatus = "idle" | "loading" | "streaming" | "stopped" | "error";

export interface ChatState {
  chatId: string | null;
  streamId: string | null;
  messages: Message[];
  currentResponse: string;
  status: ChatStatus;
  error: string | null;
  tokensUsed: number | null;
}
