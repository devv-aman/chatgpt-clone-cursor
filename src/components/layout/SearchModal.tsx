import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { chatApi } from "@/api";
import { getRoutePath } from "@/constants/routes";
import { STRINGS } from "@/constants/strings";
import type { Chat } from "@/types/chat";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEBOUNCE_DELAY = 300;

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setChats([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await chatApi.searchChats(searchQuery.trim(), 50);
        if (response.success) {
          setChats(response.data.chats);
          setSelectedIndex(0);
        }
      } catch {
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && chats.length > 0) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, chats.length]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      navigate(getRoutePath.chat(chatId));
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (chats.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % chats.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + chats.length) % chats.length);
          break;
        case "Enter":
          e.preventDefault();
          if (chats[selectedIndex]) {
            handleSelectChat(chats[selectedIndex].id);
          }
          break;
      }
    },
    [chats, selectedIndex, handleSelectChat]
  );

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-border bg-popover p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{STRINGS.SIDEBAR.SEARCH_CHATS}</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder={STRINGS.SIDEBAR.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            autoFocus
          />
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{STRINGS.SIDEBAR.SEARCHING}</span>
          </div>
        )}

        {/* Results */}
        <div
          ref={resultsRef}
          className="search-scroll max-h-80 overflow-y-auto"
        >
          {!isLoading && searchQuery.trim() && chats.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {STRINGS.SIDEBAR.NO_RESULTS}
            </div>
          ) : !searchQuery.trim() ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {STRINGS.SIDEBAR.SEARCH_PLACEHOLDER}
            </div>
          ) : (
            <div className="py-2">
              {chats.map((chat, index) => (
                <button
                  key={chat.id}
                  data-index={index}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatChatDate(chat.updated_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
