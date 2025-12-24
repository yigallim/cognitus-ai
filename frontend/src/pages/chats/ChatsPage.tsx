"use client";

import { useLocation } from "react-router";
import { useChat } from "@ai-sdk/react";
import { Conversation } from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "@/lib/constants";

function ChatsPage({
  chatId,
  initialMessages,
  image_dict,
}: {
  chatId: string;
  initialMessages: ChatMessage[];
  image_dict: Record<string, string>;
}) {
  // status: streaming
  // sendMessage: function to send message (api call)
  const { messages, setMessages } = useChat<ChatMessage & any>({
    // transport: new DefaultChatTransport({
    //   api: '/api/ai/chat'
    // }),
  });

  useEffect(() => {
    // Only hydrate with initial messages if none are present
    if (messages.length === 0 && initialMessages?.length) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  const location = useLocation();
  const [fileState] = useState(() => location.state?.files ?? []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {messages.length > 0 ? (
        <>
          <Conversation>
            <ChatMessages chatId={chatId} chatMessages={messages} image_dict={image_dict} />
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
                  chatId={chatId}
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
          <ChatInput chatId={chatId} chatMessages={messages} setChatMessages={setMessages} />
        </PromptInputProvider>
      )}
    </div>
  );
}

export default ChatsPage;
