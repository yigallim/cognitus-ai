import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useChatStore } from "@/stores/useChatStore";

export default function NewChatRoute() {
  const navigate = useNavigate();
  const createChat = useChatStore((s) => s.createChat);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const chat = await createChat("Chat");
      if (mounted && chat?.id) {
        navigate(`/chats/${chat.id}`, { replace: true });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [createChat, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Creating a new chat…</div>
    </div>
  );
}
