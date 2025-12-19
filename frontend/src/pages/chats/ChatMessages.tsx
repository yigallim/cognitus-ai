import {
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { FileUIPart, UIMessage } from "ai";
import { useEffect } from "react";
import { useStickToBottomContext } from "use-stick-to-bottom";
import ExpandedCodeBlock, { type CodeOutput } from "./ExpandedCodeBlock";
import type { ChatMessage } from "@/lib/constants";

function ChatMessages({ chatId, chatMessages }: { chatId: string; chatMessages: ChatMessage[] }) {
  const { scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 30);

    return () => clearTimeout(timer);
  }, [chatMessages]);
  console.log("chatMessages", chatMessages);
  const getOutputs = (id: string): CodeOutput[] => {
    const outputMessage = chatMessages.find((m) => m.role === "function" && m.belongsTo === id);

    if (!outputMessage || outputMessage.role !== "function" || !outputMessage.output) return [];

    try {
      const outputData = JSON.parse(outputMessage.output);
      const outputs: CodeOutput[] = [];

      Object.keys(outputData).forEach((key) => {
        if (key.startsWith("[table]")) {
          outputs.push({ type: "table" });
        } else if (key.startsWith("[text]")) {
          outputs.push({ type: "text" });
        } else if (key.startsWith("[image]")) {
          outputs.push({ type: "image" });
        }
      });
      return outputs;
    } catch (e) {
      console.error("Failed to parse output JSON", e);
      return [];
    }
  };

  return (
    <>
      <ConversationContent>
        {chatMessages.map((chatMessage, index) => {
          if (chatMessage.role === "function") return null;

          const key = `${chatId}-${index}`;

          if (
            chatMessage.role === "assistant" &&
            chatMessage.function_call &&
            chatMessage.function_call.name === "execute_code"
          ) {
            const outputs = getOutputs(chatMessage.id);
            const code = chatMessage.function_call.content;

            return (
              <Message key={key} from="assistant">
                <MessageContent>
                  <ExpandedCodeBlock
                    title="Code"
                    language="python"
                    code={code}
                    codeExplanation="Executed code block"
                    outputs={outputs}
                  />
                </MessageContent>
              </Message>
            );
          }

          return (
            <Message key={key} from={chatMessage.role as UIMessage["role"]}>
              {chatMessage.attachments && chatMessage.attachments.length > 0 && (
                <MessageAttachments className="mb-2">
                  {chatMessage.attachments.map((attachment: FileUIPart, idx: number) => (
                    <MessageAttachment key={`${key}-attachment-${idx}`} data={attachment as any} />
                  ))}
                </MessageAttachments>
              )}
              <MessageContent>
                {chatMessage.content && <MessageResponse>{chatMessage.content}</MessageResponse>}
              </MessageContent>
            </Message>
          );
        })}
      </ConversationContent>
      <ConversationScrollButton />
    </>
  );
}

export default ChatMessages;
