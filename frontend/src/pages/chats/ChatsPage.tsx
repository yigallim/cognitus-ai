"use client";

import { useLocation } from "react-router";
import { useChatStore } from "@/stores/useChatStore";
import { Conversation } from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";

function ChatsPage({
  chatId,
  initialMessages,
  image_dict,
}: {
  chatId: string;
  initialMessages: ChatMessage[];
  image_dict: Record<string, string>;
}) {
  // Manage messages locally instead of using @ai-sdk/react
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set((initialMessages ?? []).map((m) => m.id))
  );

  // Use chat store instead of external chat hook
  const fetchChats = useChatStore((state) => state.fetchChats);
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length) {
      setMessages(initialMessages);
      setSeenIds(new Set(initialMessages.map((m) => m.id)));
    }
  }, [initialMessages, messages.length, setMessages]);

  // Live SSE stream subscription with Authorization header
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (!chatId) return;

    // Ensure we start with known IDs to avoid duplicates
    setSeenIds(new Set((initialMessages ?? []).map((m) => m.id)));

    const url = `http://localhost:8000/chats/${chatId}/stream`;
    const controller = new AbortController();
    const signal = controller.signal;
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const handleFrame = (frame: string) => {
      // Parse an SSE frame: may contain id:, event:, data: (multi-line)
      const lines = frame.split(/\r?\n/);
      let dataLines: string[] = [];
      for (const line of lines) {
        if (!line || line.startsWith(":")) continue; // comment/empty
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
        // We ignore id and event fields for now
      }
      const data = dataLines.join("\n");
      if (!data) return;

      try {
        const item = JSON.parse(data);

        // Normalize backend payload to ChatMessage shape
        let normalized: ChatMessage | null = null;
        if (item.role === "user" && typeof item.content === "string") {
          normalized = {
            id: item.id,
            role: "user",
            content: item.content,
          };
        } else if (item.role === "assistant") {
          if (item.function_call) {
            normalized = {
              id: item.id,
              role: "assistant",
              function_call: {
                name: item.function_call.name,
                content: item.function_call.content ?? "",
                // Map explaination -> explanation
                explanation:
                  item.function_call.explanation ?? item.function_call.explaination ?? "",
              },
            };
          } else if (typeof item.content === "string") {
            normalized = {
              id: item.id,
              role: "assistant",
              content: item.content,
            };
          }
        } else if (item.role === "function") {
          normalized = {
            id: item.id,
            role: "function",
            belongsTo: item.belongsTo ?? "",
            output:
              typeof item.output === "string" ? item.output : JSON.stringify(item.output ?? {}),
          };
        }

        if (!normalized) return;

        setMessages((prev) => {
          // Robust duplicate check using current state
          if (prev.some((m) => m.id === normalized!.id)) return prev;
          return [...prev, normalized!];
        });
        setSeenIds((prev) => new Set([...prev, normalized!.id]));
      } catch {
        // ignore malformed events
      }
    };

    const start = async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: token
            ? { Authorization: `Bearer ${token}`, Accept: "text/event-stream" }
            : { Accept: "text/event-stream" },
          credentials: "include",
          signal,
        });

        if (!res.ok) {
          // Abort if unauthorized; let UI continue without live updates
          controller.abort();
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? ""; // keep incomplete
          for (const f of frames) handleFrame(f);
        }
      } catch {
        // Network error or aborted; ignore
      }
    };

    start();

    return () => {
      controller.abort();
    };
  }, [chatId, initialMessages, token]);

  const location = useLocation();
  const [fileState] = useState(() => location.state?.files ?? []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {messages.length > 0 ? (
        <>
          <Conversation>
            <ChatMessages chatId={chatId} chatMessages={messages} image_dict={image_dict} />
          </Conversation>
          <PromptInputProvider>
            <ChatInput
              chatId={chatId}
              chatMessages={messages}
              setChatMessages={setMessages}
              newChat={false}
            />
          </PromptInputProvider>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl text-center px-8 -mt-[10vh]">
            <h2 className="text-4xl font-semibold font-serif text-text-title-light">
              What would you like to explore today?
            </h2>

            <div className="mt-10">
              <PromptInputProvider>
                <ChatInput
                  chatId={chatId}
                  chatMessages={messages}
                  setChatMessages={setMessages}
                  files={fileState}
                  newChat={true}
                />
              </PromptInputProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatsPage;
