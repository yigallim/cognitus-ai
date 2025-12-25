import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import ChatsPage from "./ChatsPage";
import { useChatStore } from "@/stores/useChatStore";
import { getChat as apiGetChat, type Chat } from "@/api/chats";

export default function ChatRoute() {
  const { chatId = "" } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const chats = useChatStore((s) => s.chats);
  const existing = chats.find((c) => c.id === chatId);

  const [localChat, setLocalChat] = useState<Chat | null>(null);

  useEffect(() => {
    if (!existing) {
      (async () => {
        try {
          const chat = await apiGetChat(chatId);
          setLocalChat(chat);
        } catch {
          navigate("/", { replace: true });
        }
      })();
    }
  }, [chatId, existing, navigate]);

  const currentChat = existing || localChat;

  const transformedImageDict = useMemo(() => {
    if (!currentChat?.file_map) return {};

    const prefix = "http://localhost:9090/output/";
    const newDict: Record<string, string> = {};

    Object.entries(currentChat.file_map).forEach(([key, value]) => {
      newDict[key] = value.startsWith("http") ? value : `${prefix}${value}`;
    });

    return newDict;
  }, [currentChat?.file_map]);

  return (
    <ChatsPage
      key={chatId}
      chatId={chatId}
      initialMessages={currentChat?.history ?? []}
      image_dict={transformedImageDict}
    />
  );
}
