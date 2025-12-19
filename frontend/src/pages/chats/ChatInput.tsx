import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/lib/constants";
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

interface ChatInputProps {
  chatMessages: ChatMessage[];
  setChatMessages: (newChatMessages: ChatMessage[]) => void;
  files?: File[];
}

function ChatInput({ chatMessages, setChatMessages, files }: ChatInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const promptController = usePromptInputController();
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (files && files.length > 0 && !initialisedRef.current) {
      promptController.attachments.add(files as any);
      initialisedRef.current = true;
    }
  }, [files, promptController.attachments]);

  function sendMessage(message: PromptInputMessage) {
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

    setChatMessages([
      ...newChatMessages,
      {
        id: (chatMessages.length + 1).toString(),
        role: "assistant",
        content: `Response to: " + ${message.text}\n
This is example codes.\n\n
\`\`\`python
# Load labelled.csv and do an initial inspection
import pandas as pd
from tqdm import tqdm

labelled_df = pd.read_csv('labelled.csv', encoding='ascii')
print(labelled_df.head())
print(labelled_df.describe(include='all'))
\`\`\`
Simple Table:
| Header 1 | Header 2 | Header 3 | Header 3 |
|---|---|---|---|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 | Row 1, Col 4 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 | Row 2, Col 4 |`,
      },
    ]);

    setInputText("");
  }

  return (
    <div className="p-2">
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
