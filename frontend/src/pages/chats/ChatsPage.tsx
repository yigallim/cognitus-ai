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
import { getChatFiles } from "@/api/chats";

function ChatsPage({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: ChatMessage[];
}) {
  // Manage messages locally instead of using @ai-sdk/react
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [imageDict, setImageDict] = useState<Record<string, string>>({});
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set((initialMessages ?? []).map((m) => m.id))
  );
  console.log("messages", messages);
  // Use chat store instead of external chat hook
  const fetchChats = useChatStore((state) => state.fetchChats);
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages((prev) => {
        // Create a map of existing IDs to avoid duplicates
        const existingIds = new Set(prev.map((m) => m.id));
        // Filter out messages from history that we already have in state
        const newHistory = initialMessages.filter((m) => !existingIds.has(m.id));

        // Combine them (History usually comes first)
        return [...newHistory, ...prev];
      });

      setSeenIds((prev) => {
        const next = new Set(prev);
        initialMessages.forEach((m) => next.add(m.id));
        return next;
      });
    }
  }, [initialMessages]);

  // Helper: transform file_map to absolute URLs
  const transformFileMap = (map: Record<string, string>): Record<string, string> => {
    const prefix = "http://localhost:9090/output/";
    const out: Record<string, string> = {};
    Object.entries(map || {}).forEach(([key, value]) => {
      out[key] = value?.startsWith("http") ? value : `${prefix}${value}`;
    });
    return out;
  };

  // Initial file map fetch
  useEffect(() => {
    if (!chatId) return;
    getChatFiles(chatId)
      .then((map) => setImageDict(transformFileMap(map)))
      .catch(() => {
        // ignore failures
      });
  }, [chatId]);

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
      const lines = frame.split(/\r?\n/);
      let eventType = "message"; // Default event type
      let dataLines: string[] = [];

      for (const line of lines) {
        if (!line || line.startsWith(":")) continue;

        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      const dataRaw = dataLines.join("\n");
      if (!dataRaw) return;

      try {
        const parsedData = JSON.parse(dataRaw);

        // Handle Status Events
        if (eventType === "status") {
          if (parsedData.flag === "flow_started") {
            setStreaming(true);
          } else if (parsedData.flag === "flow_finished") {
            setStreaming(false);
          }
          return;
        }

        // Handle Message Events (existing logic)
        if (eventType === "message") {
          let normalized: ChatMessage | null = null;
          const item = parsedData;

          if (item.role === "user" && typeof item.content === "string") {
            normalized = { id: item.id, role: "user", content: item.content };
          } else if (item.role === "assistant") {
            if (item.function_call) {
              normalized = {
                id: item.id,
                role: "assistant",
                function_call: {
                  name: item.function_call.name,
                  content: item.function_call.content ?? "",
                  explanation:
                    item.function_call.explanation ?? item.function_call.explaination ?? "",
                },
              };
            } else if (typeof item.content === "string") {
              normalized = { id: item.id, role: "assistant", content: item.content };
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

          if (normalized) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === normalized!.id)) return prev;

              return [...prev, normalized!];
            });

            getChatFiles(chatId)
              .then((map) => setImageDict(transformFileMap(map)))
              .catch(() => {});
          }
        }
      } catch (err) {
        // console.error("Error parsing SSE frame", err);
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
          if (done) {
            break;
          }
          if (!value) continue;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? ""; // keep incomplete
          for (const f of frames) handleFrame(f);
        }
      } catch (e) {}
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
            <ChatMessages
              chatId={chatId}
              chatMessages={messages}
              image_dict={imageDict}
              streaming={streaming}
            />
          </Conversation>
          <PromptInputProvider>
            <ChatInput
              chatId={chatId}
              chatMessages={messages}
              setChatMessages={(newVal) => {
                setMessages(newVal);
              }}
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
                  setChatMessages={(newVal) => {
                    setMessages(newVal);
                  }}
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
