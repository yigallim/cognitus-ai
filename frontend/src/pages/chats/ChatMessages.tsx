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
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

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
          outputs.push({ type: "table", content: outputData[key] });
        } else if (key.startsWith("[text]")) {
          outputs.push({ type: "text", content: outputData[key] });
        } else if (key.startsWith("[image]")) {
          outputs.push({ type: "image", content: outputData[key] });
        } else if (key.startsWith("[chart]")) {
          outputs.push({ type: "chart", content: outputData[key] });
        }
      });
      return outputs;
    } catch (e) {
      console.error("Failed to parse output JSON", e);
      return [];
    }
  };

  const isLastAssistantInBlock = (index: number): boolean => {
    for (let i = index + 1; i < chatMessages.length; i++) {
      const msg = chatMessages[i];
      if (msg.role === "function") continue;
      if (msg.role === "assistant") return false;
      if (msg.role === "user") return true;
    }
    return true;
  };

  const copyAssistantBlock = (index: number) => {
    let text = "";

    for (let i = index; i >= 0; i--) {
      const msg = chatMessages[i];

      if (msg.role === "assistant") {
        if (msg.content) {
          text = msg.content + "\n" + text;
        } else if (msg.function_call?.content) {
          text = msg.function_call.content + "\n" + text;
        }
        continue;
      }

      if (msg.role === "function") continue;

      if (msg.role === "user") break;
    }

    navigator.clipboard.writeText(text.trim());
  };

  const time = "Dec 21, 06:02:04 PM"; //temporary hardcoded time

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

            const showCopyBar = isLastAssistantInBlock(index);

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
                {showCopyBar && (
                  <div className="flex items-center mb-0 pb-0 gap-2">
                    <CopyButton onCopy={() => copyAssistantBlock(index)} tooltip="Copy to clipboard" />
                    <span className="text-gray-500 text-xs align-middle">{time}</span>
                  </div>
                )}
              </Message>
            );
          }

          const isAssistant = chatMessage.role === "assistant";
          const isLastAssist = isAssistant && isLastAssistantInBlock(index);

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

              <div className={cn("flex items-center mb-0 pb-0 gap-2", isAssistant && isLastAssist ? "" : "ml-auto")}>
                {isAssistant && isLastAssist && (
                  <>
                    <CopyButton onCopy={() => copyAssistantBlock(index)} tooltip="Copy to clipboard" />
                    <span className="text-gray-500 text-xs align-middle">{time}</span>
                  </>
                )}

                {chatMessage.role === "user" && chatMessage.content && (
                  <CopyButton onCopy={() => navigator.clipboard.writeText(chatMessage.content!)} tooltip="Copy to clipboard" />
                )}
              </div>
            </Message>
          );
        })}
      </ConversationContent>
      <ConversationScrollButton />
    </>
  );
}

export default ChatMessages;