import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import ChatsPage from "./ChatsPage";
import { useChatStore } from "@/stores/useChatStore";
import { getChat as apiGetChat } from "@/api/chats";

export default function ChatRoute() {
  const { chatId = "" } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const chats = useChatStore((s) => s.chats);
  const existing = chats.find((c) => c.id === chatId);
  const [initialMessagesLocal, setInitialMessagesLocal] = useState<any[]>([]);

  const initialMessages = existing?.history ?? initialMessagesLocal;

  useEffect(() => {
    let active = true;
    (async () => {
      if (!chatId) return;
      try {
        // Fetch chat details if not in store or history is missing/empty
        if (!existing || !existing.history?.length) {
          const chat = await apiGetChat(chatId);
          if (!active) return;
          setInitialMessagesLocal(chat.history ?? []);
        } else {
          if (!active) return;
          // Keep local messages aligned with store when available
          setInitialMessagesLocal(existing.history);
        }
      } catch (err) {
        if (!active) return;
        navigate("/", { replace: true });
      }
    })();
    return () => {
      active = false;
    };
  }, [chatId, existing, navigate]);

  return (
    <ChatsPage key={chatId} chatId={chatId} initialMessages={initialMessages} image_dict={{}} />
  );
}
