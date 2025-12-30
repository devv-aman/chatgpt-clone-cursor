import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "@/stores";
import { useAuth } from "@/providers/AuthProvider";
import { useModel } from "@/providers/ModelProvider";
import {
  PromptContainer,
  MessageBubble,
  AIOutputContainer,
} from "./components";
import { STRINGS } from "@/constants/strings";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return STRINGS.GREETING.MORNING;
  } else if (hour < 17) {
    return STRINGS.GREETING.AFTERNOON;
  } else {
    return STRINGS.GREETING.EVENING;
  }
}

export function Chat() {
  const { chatId: urlChatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { model } = useModel();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand store selectors
  const activeChatId = useChatStore((state) => state.activeChatId);
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const loadChatMessages = useChatStore((state) => state.loadChatMessages);
  const sendMessageAction = useChatStore((state) => state.sendMessage);
  const stopStreamAction = useChatStore((state) => state.stopStream);

  // Get current chat state
  const chatState = useMemo(() => {
    const id = activeChatId || urlChatId;
    if (!id) return null;
    return chats.get(id) || null;
  }, [activeChatId, urlChatId, chats]);

  const messages = chatState?.messages || [];
  const currentResponse = chatState?.currentResponse || "";
  const status = chatState?.status || "idle";
  const isStreaming = status === "streaming";
  const tokensUsed = chatState?.tokensUsed;

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = useMemo(() => {
    return user?.name?.split(" ")[0] || "";
  }, [user?.name]);

  // Sync URL chatId with store
  useEffect(() => {
    if (urlChatId) {
      setActiveChat(urlChatId);
      loadChatMessages(urlChatId);
    } else {
      // No chatId in URL - clear active chat for new chat view
      setActiveChat(null);
    }
  }, [urlChatId, setActiveChat, loadChatMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      sendMessageAction(inputValue, model, navigate);
      setInputValue("");
    }
  }, [inputValue, model, navigate, sendMessageAction]);

  const handleStop = useCallback(() => {
    const chatId = activeChatId || urlChatId;
    if (chatId) {
      stopStreamAction(chatId);
    }
  }, [activeChatId, urlChatId, stopStreamAction]);

  const hasMessages = messages.length > 0 || currentResponse;

  return (
    <div className="flex h-full flex-col">
      {!hasMessages ? (
        // Centered prompt for new chat
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          {/* Greeting Title */}
          <h1 className="mb-8 text-3xl font-semibold text-foreground">
            {greeting}, {firstName}
          </h1>
          <PromptContainer
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onStop={handleStop}
            isStreaming={isStreaming}
            centered
          />
        </div>
      ) : (
        // Chat view with messages
        <>
          {/* Messages container */}
          <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Streaming response */}
              {status === "streaming" && (
                <div className="py-2">
                  <AIOutputContainer
                    content={currentResponse}
                    isStreaming={true}
                    showThinking={!currentResponse}
                    tokensUsed={tokensUsed?.total_tokens}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky bottom prompt */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-4">
            <PromptContainer
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              onStop={handleStop}
              isStreaming={isStreaming}
            />
          </div>
        </>
      )}
    </div>
  );
}
