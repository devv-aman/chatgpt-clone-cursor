import { useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHAT_STRINGS, CHAT_CONFIG } from '../constants';

interface PromptContainerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  centered?: boolean;
}

export function PromptContainer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled = false,
  centered = false,
}: PromptContainerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height within min/max bounds
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, CHAT_CONFIG.TEXTAREA_MIN_HEIGHT),
      CHAT_CONFIG.TEXTAREA_MAX_HEIGHT
    );
    
    textarea.style.height = `${newHeight}px`;
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      adjustHeight();
    },
    [onChange, adjustHeight]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter without shift submits the form
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming && value.trim()) {
          onSubmit();
        }
      }
    },
    [isStreaming, value, onSubmit]
  );

  const handleButtonClick = useCallback(() => {
    if (isStreaming) {
      onStop();
    } else if (value.trim()) {
      onSubmit();
    }
  }, [isStreaming, value, onSubmit, onStop]);

  const containerClasses = centered
    ? 'w-full max-w-3xl mx-auto'
    : 'w-full max-w-3xl mx-auto';

  return (
    <div className={containerClasses}>
      <div className="relative flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={CHAT_STRINGS.PLACEHOLDER}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            minHeight: `${CHAT_CONFIG.TEXTAREA_MIN_HEIGHT}px`,
            maxHeight: `${CHAT_CONFIG.TEXTAREA_MAX_HEIGHT}px`,
          }}
        />
        <Button
          type="button"
          size="icon"
          variant={isStreaming ? 'destructive' : 'default'}
          onClick={handleButtonClick}
          disabled={disabled || (!isStreaming && !value.trim())}
          aria-label={isStreaming ? CHAT_STRINGS.STOP_LABEL : CHAT_STRINGS.SEND_LABEL}
          className="shrink-0"
        >
          {isStreaming ? (
            <Square className="size-4" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

