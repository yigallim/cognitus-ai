import { create } from "zustand";
import {
  listChats as apiListChats,
  createChat as apiCreateChat,
  deleteChat as apiDeleteChat,
  updateChat as apiUpdateChat,
  type Chat,
} from "@/api/chats";

interface ChatState {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  fetchChats: () => Promise<void>;
  createChat: (
    title?: string,
    user_instruction?: string,
    database_name?: string
  ) => Promise<Chat | null>;
  deleteChat: (chatId: string) => Promise<boolean>;
  renameChat: (chatId: string, title?: string) => Promise<Chat | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  loading: false,
  error: null,

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const chats = await apiListChats();
      set({ chats, loading: false });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load chats", loading: false });
    }
  },

  createChat: async (title = "Chat", user_instruction?: string, database_name?: string) => {
    try {
      set({ loading: true, error: null });
      const chat = await apiCreateChat({ title, user_instruction, database_name });
      set({ chats: [chat, ...get().chats], loading: false });
      return chat;
    } catch (err: any) {
      set({ error: err?.message || "Failed to create chat", loading: false });
      return null;
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      set({ loading: true, error: null });
      await apiDeleteChat(chatId);
      set({ chats: get().chats.filter((c) => c.id !== chatId), loading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || "Failed to delete chat", loading: false });
      return false;
    }
  },

  renameChat: async (chatId: string, title = "Chat") => {
    try {
      set({ loading: true, error: null });
      const chat = await apiUpdateChat(chatId, { title });
      set({
        chats: get().chats.map((c) => (c.id === chatId ? chat : c)),
        loading: false,
      });
      return chat;
    } catch (err: any) {
      set({ error: err?.message || "Failed to rename chat", loading: false });
      return null;
    }
  },
}));
