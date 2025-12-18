"use client";

import { useLocation } from "react-router";
import { useChat } from "@ai-sdk/react";
import { type UIMessage } from "ai";
import { Conversation } from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

function ChatsPage({ chatId, initialMessages }: { chatId: string; initialMessages: UIMessage[] }) {
  // status: pending to be used for the streaming
  // sendMessage: function to send message (api call)
  const { messages, setMessages, status, sendMessage } = useChat({
    // messages: initialMessages,
    // transport: new DefaultChatTransport({
    //   api: '/api/ai/chat'
    // }),
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // handle the files sent from FilesPage
  const location = useLocation();
  const [fileState] = useState(() => location.state?.files ?? []);

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 ? (
        <>
          <Conversation>
            <ChatMessages chatId={chatId} chatMessages={messages} />
          </Conversation>
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
                  chatMessages={messages}
                  setChatMessages={setMessages}
                  files={fileState}
                />
              </PromptInputProvider>
            </div>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <PromptInputProvider>
          <ChatInput chatMessages={messages} setChatMessages={setMessages} />
        </PromptInputProvider>
      )}
    </div>
  );
}

export default ChatsPage;
