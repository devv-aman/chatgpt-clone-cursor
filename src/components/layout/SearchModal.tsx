import { useState, useEffect, useCallback, useMemo } from "react";
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

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all chats when modal opens
  useEffect(() => {
    if (open) {
      loadChats();
    } else {
      // Reset state when modal closes
      setSearchQuery("");
    }
  }, [open]);

  const loadChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getChats(100, 0);
      if (response.success) {
        setChats(response.data.chats);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [chats, searchQuery]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      navigate(getRoutePath.chat(chatId));
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{STRINGS.SIDEBAR.SEARCH_CHATS}</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            placeholder={STRINGS.SIDEBAR.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-auto border-0 p-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {searchQuery
                ? STRINGS.SIDEBAR.NO_RESULTS
                : STRINGS.SIDEBAR.NO_CHATS}
            </div>
          ) : (
            <div className="py-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
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
