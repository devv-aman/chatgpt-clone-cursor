import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { MessageSquare, Loader2 } from "lucide-react";
import { useChatStore } from "@/stores";
import { getRoutePath } from "@/constants/routes";
import { STRINGS } from "@/constants/strings";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function ChatHistoryList() {
  const { chatId: activeChatId } = useParams<{ chatId: string }>();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Zustand store selectors
  const chatList = useChatStore((state) => state.chatList);
  const chatListTotal = useChatStore((state) => state.chatListTotal);
  const chatListLoading = useChatStore((state) => state.chatListLoading);
  const loadChatList = useChatStore((state) => state.loadChatList);

  const hasMore = chatList.length < chatListTotal;

  // Initial load
  useEffect(() => {
    loadChatList(false);
  }, [loadChatList]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !chatListLoading) {
          loadChatList(true);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, chatListLoading, loadChatList]);

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy, h:mm a");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sticky top-0 z-10 bg-sidebar">
        {STRINGS.SIDEBAR.YOUR_CHATS}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chatList.length === 0 && !chatListLoading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {STRINGS.SIDEBAR.NO_CHATS}
            </div>
          )}

          {chatList.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                asChild
                isActive={activeChatId === chat.id}
                tooltip={chat.title}
              >
                <Link to={getRoutePath.chat(chat.id)}>
                  <MessageSquare className="size-4" />
                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <span className="truncate font-medium">
                      {chat.isStreaming ? (
                        <span className="flex items-center gap-1.5">
                          <span className="truncate">{chat.title}</span>
                          <span className="typing-indicator flex gap-0.5">
                            <span className="dot size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                            <span className="dot size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                            <span className="dot size-1 animate-bounce rounded-full bg-muted-foreground" />
                          </span>
                        </span>
                      ) : (
                        chat.title
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatChatDate(chat.updated_at)}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* Loading indicator / Observer target */}
          <div ref={observerTarget} className="flex justify-center py-2">
            {chatListLoading && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
