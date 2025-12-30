import { AIOutputContainer } from "./AIOutputContainer";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[85%] ${
          isUser
            ? "rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-foreground"
            : "py-2 text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <AIOutputContainer
            content={message.content}
            isStreaming={isStreaming}
            tokensUsed={message.usage?.total_tokens ?? message.tokens_used}
          />
        )}
      </div>
    </div>
  );
}
