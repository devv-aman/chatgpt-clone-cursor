import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { OpenAI } from "@lobehub/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatHistoryList } from "./ChatHistoryList";
import { SearchModal } from "./SearchModal";
import { useChatStore } from "@/stores";
import { ROUTES } from "@/constants/routes";
import { STRINGS } from "@/constants/strings";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const clearActiveChat = useChatStore((state) => state.clearActiveChat);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewChat = () => {
    clearActiveChat();
    navigate(ROUTES.CHAT);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to={ROUTES.CHAT}>
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <OpenAI size={24} />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">{STRINGS.APP_NAME}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* New Chat CTA */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleNewChat}
                    tooltip={STRINGS.CHAT.NEW_CHAT}
                    className="font-medium"
                  >
                    <Plus className="size-4" />
                    <span>{STRINGS.CHAT.NEW_CHAT}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Search Chats CTA */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsSearchOpen(true)}
                    tooltip={STRINGS.SIDEBAR.SEARCH_CHATS}
                  >
                    <Search className="size-4" />
                    <span className="flex-1">
                      {STRINGS.SIDEBAR.SEARCH_CHATS}
                    </span>
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent px-1.5 font-mono text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden sm:flex">
                      {STRINGS.SIDEBAR.SEARCH_SHORTCUT}
                    </kbd>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Chat History */}
          <ChatHistoryList />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
