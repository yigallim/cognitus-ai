import api from "@/lib/api";
import type { ChatMessage } from "@/lib/constants";

export type Chat = {
  id: string;
  title: string;
  history: ChatMessage[];
  created_at?: string;
  updated_at?: string;
};

export type ChatCreate = {
  title: string;
  user_instruction?: string;
};

export type ChatUpdate = {
  title?: string;
};

export const listChats = async (): Promise<Chat[]> => {
  const res = await api.get("/chats");
  return res.data;
};

export const createChat = async (payload: ChatCreate): Promise<Chat> => {
  const res = await api.post("/chats", payload);
  return res.data;
};

export const getChat = async (chatId: string): Promise<Chat> => {
  const res = await api.get(`/chats/${chatId}`);
  return res.data;
};

export const updateChat = async (chatId: string, payload: ChatUpdate): Promise<Chat> => {
  const res = await api.patch(`/chats/${chatId}`, payload);
  return res.data;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  await api.delete(`/chats/${chatId}`);
};

// Interact with the agent for a specific chat
export type AgentInstructionPayload = {
  user_instruction: string;
};

export const sendAgentInstruction = async (
  chatId: string,
  payload: AgentInstructionPayload
): Promise<any> => {
  const res = await api.post(`/chats/${chatId}/agent`, payload);
  return res.data;
};
