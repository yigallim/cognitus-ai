import "./App.css";
import AppSidebar from "./sidebar/AppSidebar";
import { Cpu, MemoryStick, Server, Settings } from "lucide-react";
import { Button } from "./components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import "@fontsource/libre-baskerville/index.css";
import type { ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { cn } from "./lib/utils";

function AppLayout({ children }: { children: ReactNode }) {
  const status = "Connected";
  const isConnected = status === "Connected";

  const monitorResources = [
    {
      name: "RAM Usage",
      metric: "/2GB",
      icon: MemoryStick
    },
    {
      name: "CPU Utilization",
      metric: "%",
      icon: Cpu
    }
  ]

  const currentMetric = [
    { name: "RAM Usage", value: "0.5" },
    { name: "CPU Utilization", value: "0.0" }
  ]

  function settings() {
    // pop up the settings panel
    alert("Settings panel is under development.");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <SidebarInset>
          <header className="h-12 flex border-b px-4 items-center">
            <SidebarTrigger className="md:hidden mr-2" />

            <div className="flex w-full justify-end items-center gap-2 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild
                  className={cn("rounded-lg border border-gray-300 py-1 focus-visible:ring-[1px]", isConnected ? "text-green-500 hover:text-green-500" : "text-amber-500 hover:text-amber-500")}>
                  <Button variant="ghost">
                    <Server className="size-4" />
                    <span className="text-base">{status}</span>
                    <span className="relative flex pt-0.75">
                      <span className={cn("relative inline-flex rounded-full h-2 w-2", isConnected ? "bg-green-500" : "bg-amber-500")}></span>
                    </span>
                  </Button>

                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="rounded-lg p-4"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <div className="flex flex-col gap-1 pb-3">
                    <p className="text-base font-medium text-foreground">Cognitus Resource Monitor</p>
                  </div>

                  <div className="flex flex-col gap-4 pb-3">
                    {monitorResources.map((resource) => (
                      <div key={resource.name} className="flex gap-3 items-center min-w-0">
                        <div className="w-fit h-fit border border-muted rounded-lg p-3 ">
                          <resource.icon className="w-4 h-4 " />
                        </div>
                        <div className="grow flex flex-col gap-1 min-w-0">
                          <div className="grow flex justify-between items-center">
                            <p className="text-sm font-medium truncate text-[var(--foreground)]">{resource.name}</p>
                            <p className="text-muted-secondary text-sm font-normal whitespace-nowrap ml-2">
                              {currentMetric.find(metric => metric.name === resource.name)?.value}{resource.metric}
                            </p>
                          </div>
                          <div className="flex gap-[1px]">
                            {resource.name == "CPU Utilization" &&
                              [...Array(60)].map((_, index) => (
                                <div key={index} className="w-[3px] h-3 transition-all duration-100 bg-muted"></div>
                              ))
                            }
                            {resource.name == "RAM Usage" &&
                            [...Array(2)].map((_, index) => (
                                <div key={index} className="w-[3px] h-3 transition-all duration-100 bg-green-500"></div>
                              ))}
                            {resource.name == "RAM Usage" && [...Array(58)].map((_, index) => (
                              <div key={index} className="w-[3px] h-3 transition-all duration-100 bg-muted"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-between gap-2 pt-1">
                    <Button className="w-full border border-gray-300">Reboot</Button>
                    <Button className="w-full bg-gray-50 text-black border border-gray-300 hover:bg-gray-100">Reset</Button>
                  </div>

                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" onClick={settings}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;