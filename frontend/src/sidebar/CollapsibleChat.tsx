import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, MoreHorizontal, Pencil, Search, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import RenameChatModal from "./RenameChatModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CollapsibleChatProps = {
  item: {
    title: string;
    icon: React.ComponentType<any>;
    url: string;
    items?: {
      title: string;
      url: string;
    }[];
  };
  location: {
    pathname: string;
  };
};

function CollapsibleChat({ item, location }: CollapsibleChatProps) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const deleteChat = useChatStore((s) => s.deleteChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const [renameOpen, setRenameOpen] = useState(false);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string>("Chat");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>("Chat");
  const isChatPath = location.pathname.startsWith("/chats/");
  const [collapsibleOpen, setCollapsibleOpen] = useState(isChatPath);

  useEffect(() => {
    if (isChatPath) setCollapsibleOpen(true);
  }, [isChatPath]);

  const filteredChats = item.items?.filter((chat) =>
    chat.title.toLowerCase().includes(searchText.toLowerCase())
  );
  console.log("isChatPath", isChatPath);
  return (
    <Collapsible
      key={item.title}
      asChild
      className="group/collapsible"
      open={collapsibleOpen}
      onOpenChange={setCollapsibleOpen}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <item.icon className="size-4" />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem className="px-1 relative">
              <Label className="sr-only">Search</Label>
              <SidebarInput
                id="chat-search"
                placeholder="Search chats"
                className="pl-8 bg-sidebar-input text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:ring-2 focus:ring-sidebar-accent focus:ring-offset-0 border border-gray-300 rounded-lg"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-50 select-none" />
            </SidebarMenuSubItem>

            {filteredChats?.map((subItem, idx) => (
              <SidebarMenuSubItem key={idx}>
                <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                  <Link to={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction>
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="rounded-lg">
                    <DropdownMenuItem
                      onClick={() => {
                        const id = subItem.url.split("/").pop() || "";
                        setPendingChatId(id);
                        setPendingTitle(subItem.title || "Chat");
                        setRenameOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const id = subItem.url.split("/").pop() || "";
                        setDeleteChatId(id);
                        setDeleteTitle(subItem.title || "Chat");
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash className="size-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuSubItem>
            ))}
            <RenameChatModal
              open={renameOpen}
              onOpenChange={(o) => setRenameOpen(o)}
              initialTitle={pendingTitle}
              onSubmit={async (newTitle) => {
                if (!pendingChatId) return;
                await renameChat(pendingChatId, newTitle);
                setRenameOpen(false);
                setPendingChatId(null);
              }}
            />
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent className="rounded-lg">
                <DialogHeader>
                  <DialogTitle>Delete chat</DialogTitle>
                  <DialogDescription>
                    This will permanently delete "{deleteTitle}" and its messages. This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDeleteOpen(false);
                      setDeleteChatId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!deleteChatId) return;
                      const ok = await deleteChat(deleteChatId);
                      setDeleteOpen(false);
                      setDeleteChatId(null);
                      if (ok) {
                        navigate("/", { replace: true });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default CollapsibleChat;
