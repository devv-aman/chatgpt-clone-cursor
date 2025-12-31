export const CHAT_STRINGS = {
  PLACEHOLDER: "Ask anything...",
  SEND_LABEL: "Send message",
  STOP_LABEL: "Stop generating",
  COPY_LABEL: "Copy response",
  COPIED_LABEL: "Copied!",
  THINKING: "Thinking",
  TOKENS_LABEL: "tokens",
  ERROR_NO_MESSAGE: "Please enter a message",
  ERROR_STREAM_FAILED: "Failed to start stream",
} as const;

export const MODEL_OPTIONS = [
  { id: "gpt-5.2", label: "GPT-5.2" },
  { id: "gpt-5.1", label: "GPT-5.1" },
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-4o", label: "GPT-4o" },
] as const;

export const CHAT_CONFIG = {
  TEXTAREA_MIN_HEIGHT: 52,
  TEXTAREA_MAX_HEIGHT: 200,
  DEFAULT_MODEL: "gpt-5.2",
  AUTO_SCROLL_THRESHOLD: 10,
} as const;
