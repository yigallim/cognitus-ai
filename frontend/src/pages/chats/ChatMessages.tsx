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
import ImageOutput from "@/components/ImageOutput";
import { Loader } from "@/components/ai-elements/loader";

type InlinePart = { type: "text"; content: string } | { type: "image"; id: string };

function ChatMessages({
  chatId,
  chatMessages,
  image_dict,
  streaming,
}: {
  chatId: string;
  chatMessages: ChatMessage[];
  image_dict: Record<string, string>;
  streaming: boolean;
}) {
  const { scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 30);

    return () => clearTimeout(timer);
  }, [chatMessages]);

  const getOutputs = (id: string): CodeOutput[] => {
    const outputMessage = chatMessages.find((m) => m.role === "function" && m.belongsTo === id);

    if (!outputMessage || outputMessage.role !== "function" || !outputMessage.output) return [];

    try {
      const outputData = JSON.parse(outputMessage.output);
      const outputs: CodeOutput[] = [];
      // New format support: { text: string[], image: string[], table: TableData[] }
      const hasNewFormat =
        outputData &&
        (Array.isArray(outputData.text) ||
          Array.isArray(outputData.image) ||
          Array.isArray(outputData.table));

      if (hasNewFormat) {
        if (Array.isArray(outputData.text)) {
          outputData.text.forEach((t: string) => outputs.push({ type: "text", content: t }));
        }
        if (Array.isArray(outputData.image)) {
          outputData.image.forEach((img: string) =>
            outputs.push({ type: "image", content: image_dict[img] ?? img })
          );
        }
        if (Array.isArray(outputData.table)) {
          outputData.table.forEach((tbl: any) => outputs.push({ type: "table", content: tbl }));
        }
        return outputs;
      }

      // Legacy format fallback using key prefixes
      // Object.keys(outputData).forEach((key) => {
      //   if (key.startsWith("[table]")) {
      //     outputs.push({ type: "table", content: outputData[key] });
      //   } else if (key.startsWith("[text]")) {
      //     outputs.push({ type: "text", content: outputData[key] });
      //   } else if (key.startsWith("[image]")) {
      //     outputs.push({ type: "image", content: image_dict[outputData[key]] ?? outputData[key] });
      //   } else if (key.startsWith("[chart]")) {
      //     outputs.push({ type: "chart", content: image_dict[outputData[key]] ?? outputData[key] });
      //   }
      // });
      return outputs;
    } catch (e) {
      console.error("Failed to parse output JSON", e);
      return [];
    }
  };

  const parseInlineContent = (content: string): InlinePart[] => {
    const IMAGE_TAG_REGEX = /<image-tag>(.*?)<\/image-tag>/g;
    const parts: InlinePart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = IMAGE_TAG_REGEX.exec(content)) !== null) {
      const start = match.index;
      const end = IMAGE_TAG_REGEX.lastIndex;
      const imageId = match[1];

      // text before image tag
      if (start > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, start),
        });
      }

      // image token
      parts.push({
        type: "image",
        id: imageId,
      });

      lastIndex = end;
    }

    // remaining text after last image
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
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
          text = msg.content + "\n\n" + text;
        } else if (msg.function_call?.content) {
          text = msg.function_call.content + "\n\n" + text;
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
            (chatMessage.function_call.name === "execute_code" ||
              chatMessage.function_call.name === "execute_sql_query" ||
              chatMessage.function_call.name === "export_as_csv")
          ) {
            const isPythonCode = chatMessage.function_call.name === "execute_code";
            const isExport = chatMessage.function_call.name === "export_as_csv";

            const outputs = getOutputs(chatMessage.id);
            const code = chatMessage.function_call.content;
            // Support both correctly spelled "explanation" and commonly misspelled "explaination"
            const codeExplanation =
              (chatMessage.function_call as any).explanation ??
              (chatMessage.function_call as any).explaination ??
              "";
            const showCopyBar = isLastAssistantInBlock(index);

            return (
              <Message key={key} from="assistant">
                <MessageContent>
                  <ExpandedCodeBlock
                    title={isPythonCode ? "Code" : isExport ? "Export as CSV" : "SQL Query"}
                    language={isPythonCode ? "python" : "MySQL"}
                    code={code.trim()}
                    codeExplanation={codeExplanation}
                    outputs={outputs}
                  />
                </MessageContent>
                {showCopyBar && (
                  <div className="flex items-center mb-0 pb-0 gap-2">
                    <CopyButton
                      onCopy={() => copyAssistantBlock(index)}
                      tooltip="Copy to clipboard"
                    />
                    <span className="text-gray-500 text-xs align-middle">{time}</span>
                  </div>
                )}
              </Message>
            );
          }

          const rawContent = chatMessage.content || "";
          const parts = parseInlineContent(chatMessage.role === "user" ? rawContent : rawContent);
          const isAssistant = chatMessage.role === "assistant";
          const isLastAssist = isAssistant && isLastAssistantInBlock(index);

          return (
            <>
              <Message key={key} from={chatMessage.role as UIMessage["role"]}>
                {chatMessage.attachments && chatMessage.attachments.length > 0 && (
                  <MessageAttachments className="mb-2">
                    {chatMessage.attachments.map((attachment: FileUIPart, idx: number) => (
                      <MessageAttachment
                        key={`${key}-attachment-${idx}`}
                        data={attachment as any}
                      />
                    ))}
                  </MessageAttachments>
                )}

                <MessageContent>
                  {parts.map((part, idx) => {
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={`${key}-part-${idx}`}>{part.content}</MessageResponse>
                      );
                    }

                    if (part.type === "image") {
                      return (
                        <ImageOutput
                          key={`${key}-part-${idx}`}
                          currentItem={{
                            type: "image",
                            content: image_dict[part.id],
                            title: "Image",
                          }}
                        />
                      );
                    }
                  })}
                </MessageContent>

                <div
                  className={cn(
                    "flex items-center mb-0 pb-0 gap-2",
                    isAssistant && isLastAssist ? "" : "ml-auto"
                  )}
                >
                  {isAssistant && isLastAssist && (
                    <>
                      <CopyButton
                        onCopy={() => copyAssistantBlock(index)}
                        tooltip="Copy to clipboard"
                      />
                      <span className="text-gray-500 text-xs align-middle">{time}</span>
                    </>
                  )}

                  {chatMessage.role === "user" && chatMessage.content && (
                    <CopyButton
                      onCopy={() => navigator.clipboard.writeText(chatMessage.content!)}
                      tooltip="Copy to clipboard"
                    />
                  )}
                </div>
              </Message>
            </>
          );
        })}
        {streaming && (
          <Message from="assistant">
            <MessageContent>
              <div className="justify-left gap-2 flex flex-row items-center">
                <Loader size={16} />
                <span className="animate-pulse">Cognitus is thinking</span>
              </div>
            </MessageContent>
          </Message>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </>
  );
}

export default ChatMessages;
