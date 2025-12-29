import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { PromptContainer, MessageBubble, AIOutputContainer } from './components';

export function Chat() {
  const { chatId: urlChatId } = useParams<{ chatId: string }>();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    currentResponse,
    status,
    isStreaming,
    sendMessage,
    stopStream,
    loadChatMessages,
  } = useChat();

  // Load chat messages when URL changes
  useEffect(() => {
    if (urlChatId) {
      loadChatMessages(urlChatId);
    }
  }, [urlChatId, loadChatMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  }, [inputValue, sendMessage]);

  const hasMessages = messages.length > 0 || currentResponse;


  return (
    <div className="flex h-full flex-col">
      {!hasMessages ? (
        // Centered prompt for new chat
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <PromptContainer
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onStop={stopStream}
            isStreaming={isStreaming}
            centered
          />
        </div>
      ) : (
        // Chat view with messages
        <>
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {/* Streaming response */}
              {status === 'streaming' && (
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z"/>
                    </svg>
                  </div>
                  <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-foreground">
                    <AIOutputContainer
                      content={currentResponse}
                      isStreaming={true}
                      showThinking={!currentResponse}
                    />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky bottom prompt */}
          <div className="border-t border-border bg-background px-4 py-4">
            <PromptContainer
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              onStop={stopStream}
              isStreaming={isStreaming}
            />
          </div>
        </>
      )}
    </div>
  );
}

