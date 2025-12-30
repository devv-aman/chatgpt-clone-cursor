import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ModelDropdown } from "./ModelDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { ModelProvider, useModel } from "@/providers/ModelProvider";

function MainLayoutContent() {
  const { model, setModel } = useModel();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <ModelDropdown value={model} onChange={setModel} />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function MainLayout() {
  return (
    <ModelProvider>
      <MainLayoutContent />
    </ModelProvider>
  );
}
