import "./App.css";
import AppSidebar from "./sidebar/AppSidebar";
import { Server, Settings } from "lucide-react";
import { Button } from "./components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import "@fontsource/libre-baskerville/index.css";
import { useState, type ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { cn } from "./lib/utils";
import ResourceContainer from "./components/ResourceContainer";

function AppLayout({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"Connecting" | "Connected">("Connected");
  const isConnected = status === "Connected";

  const currentMetric = [
    { name: "RAM Usage", value: "0.5" },
    { name: "CPU Utilization", value: "0.0" },
  ];

  function settings() { }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <SidebarInset>
          <header className="h-12 flex border-b px-4 items-center">
            <SidebarTrigger className="md:hidden mr-2" />

            <div className="flex w-full justify-end items-center gap-2 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className={cn(
                    "rounded-lg border border-gray-300 py-1 focus-visible:ring-[1px]",
                    isConnected
                      ? "text-green-500 hover:text-green-500"
                      : "text-amber-500 hover:text-amber-500"
                  )}
                >
                  <Button variant="ghost">
                    <Server className="size-4" />
                    <span className="text-base">{status}</span>
                    <span className="relative flex pt-0.75">
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-2 w-2",
                          isConnected ? "bg-green-500" : "bg-amber-500"
                        )}
                      ></span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="rounded-lg p-4"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <ResourceContainer currentMetric={currentMetric} isConnected={isConnected} />
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" onClick={settings}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 overflow-hidden min-h-0 min-w-0">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
