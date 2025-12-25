import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/lib/constants";
import { sendAgentInstruction } from "@/api/chats";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { useChatStore } from "@/stores/useChatStore";

interface ChatInputProps {
  chatId?: string;
  chatMessages: ChatMessage[];
  setChatMessages: (newChatMessages: ChatMessage[]) => void;
  files?: File[];
  newChat: boolean;
}

function ChatInput({ chatId, chatMessages, setChatMessages, newChat, files }: ChatInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const promptController = usePromptInputController();
  const initialisedRef = useRef(false);
  const navigate = useNavigate();
  const createChat = useChatStore((s) => s.createChat);
  const fetchChats = useChatStore((state) => state.fetchChats);

  useEffect(() => {
    if (files && files.length > 0 && !initialisedRef.current) {
      promptController.attachments.add(files as any);
      initialisedRef.current = true;
    }
  }, [files, promptController.attachments]);

  async function sendMessage(message: PromptInputMessage) {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    const newChatMessages: ChatMessage[] = [
      ...chatMessages,
      {
        id: chatMessages.length.toString(),
        role: "user",
        content: message.text,
        attachments: message.files,
      },
    ];

    // Optimistically add the user message
    setChatMessages(newChatMessages);

    // Create a backend chat only when first sending in a new chat
    let targetChatId = chatId;
    const isNewChat = newChat;
    if (isNewChat) {
      const chat = await createChat("Chat", message.text ?? "");
      if (chat?.id) {
        targetChatId = chat.id;
        navigate(`/chats/${chat.id}`, { replace: true });
      }
    } else {
      try {
        // If we just created the chat and already passed instruction, avoid double-sending
        if (targetChatId) {
          await sendAgentInstruction(targetChatId, {
            user_instruction: message.text ?? "",
          });
        }
      } catch (e) {
        // TODO: surface error to user via toast
        console.error("Failed to send instruction to agent", e);
      }
    }

    // Send the instruction to the agent endpoint
    fetchChats();
    setInputText("");
  }

  return (
    <div className="px-1 py-0.5 mb-0">
      <PromptInput onSubmit={sendMessage} globalDrop multiple className="bg-muted rounded-2xl">
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea
            value={inputText}
            placeholder="Connect data and start chatting..."
            onChange={(e) => setInputText(e.target.value)}
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionAddAttachments />
          </PromptInputTools>

          <PromptInputSubmit disabled={!inputText.trim()}>
            <SendHorizontal />
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

export default ChatInput;
