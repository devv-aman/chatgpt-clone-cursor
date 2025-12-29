import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, Loader2 } from 'lucide-react';
import { chatApi } from '@/api';
import { getRoutePath } from '@/constants/routes';
import { STRINGS } from '@/constants/strings';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { Chat } from '@/types/chat';

const CHATS_PER_PAGE = 20;

export function ChatHistoryList() {
  const { chatId: activeChatId } = useParams<{ chatId: string }>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadChats = useCallback(async (append = false) => {
    // Use ref to prevent race conditions
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    const currentOffset = append ? offsetRef.current : 0;
    
    try {
      const response = await chatApi.getChats(CHATS_PER_PAGE, currentOffset);
      if (response.success) {
        const newChats = response.data.chats;
        setChats((prev) => (append ? [...prev, ...newChats] : newChats));
        setHasMore(currentOffset + newChats.length < response.data.total);
        offsetRef.current = currentOffset + newChats.length;
        setError(false);
      }
    } catch {
      // Silently fail - user might not be authenticated
      // Stop retrying on error to prevent infinite loops
      setHasMore(false);
      setError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Initial load - only once
  useEffect(() => {
    loadChats(false);
  }, [loadChats]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (error) return; // Don't set up observer if there was an error
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadChats(true);
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
  }, [hasMore, error, loadChats]);

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy, h:mm a');
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sticky top-0 z-10 bg-sidebar">
        {STRINGS.SIDEBAR.YOUR_CHATS}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.length === 0 && !isLoading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {STRINGS.SIDEBAR.NO_CHATS}
            </div>
          )}
          
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                asChild
                isActive={activeChatId === chat.id}
                tooltip={chat.title}
              >
                <Link to={getRoutePath.chat(chat.id)}>
                  <MessageSquare className="size-4" />
                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <span className="truncate font-medium">{chat.title}</span>
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
            {isLoading && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

