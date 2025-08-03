import { cookies } from "next/headers";

import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import Script from "next/script";
import { DataStreamProvider } from "@/components/data-stream-provider";

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </DataStreamProvider>
    </>
  );
};

export default ChatLayout;
