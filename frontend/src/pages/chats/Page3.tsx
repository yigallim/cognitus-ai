import { Conversation } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import ExpandedCodeBlock from "./ExpandedCodeBlock";
import {
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import ChatInput from "./ChatInput";

function Page3() {
  return (
    <div className="flex flex-col h-full">
      <Conversation>
        <ConversationContent className="gap-4">
          <Message from="user">
            <MessageContent>
              <MessageResponse>Calculate the mean fare paid by the passengers.</MessageResponse>
            </MessageContent>
          </Message>

          <Message from="assistant">
            <MessageContent>
              <ExpandedCodeBlock
                code={`# Importing necessary libraries
import pandas as pd

# Load the dataset
file_path = './input/test_ave.csv'
data = pd.read_csv(file_path)

# Display the first few rows of the dataset to understand its structure
data.head()`}
                language="Python"
                title="Code"
                codeExplanation="Importing pandas and loading the dataset from './input/test_ave.csv' to inspect the first few rows."
                outputs={[{ type: "table" }]}
              />
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageContent>
              <ExpandedCodeBlock
                code={`# Calculate the mean fare paid by the passengers
mean_fare = data['Fare'].mean()  # Using the correct column name
mean_fare_rounded = round(mean_fare, 2)

mean_fare_rounded`}
                language="Python"
                title="Code"
                codeExplanation="Calculating the average fare from the 'Fare' column and rounding it to two decimal places."
                outputs={[{ type: "text" }]}
              />
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>
                {`# Summary of the Analysis
The task was to calculate the mean fare paid by passengers using the dataset \`test_ave.csv\`. The following steps were taken to achieve this:

1. **Data Loading**: The dataset was successfully loaded into a pandas DataFrame.
2. **Mean Calculation**: The mean fare was calculated using the 'Fare' column from the dataset.
3. **Rounding**: The result was rounded to two decimal places.

## Result
The mean fare paid by the passengers is **34.65**.

If you have any further questions or need additional analysis, feel free to ask!`}
              </MessageResponse>
            </MessageContent>
          </Message>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInputProvider>
        <ChatInput chatMessages={[]} setChatMessages={() => {}} />
      </PromptInputProvider>
    </div>
  );
}

export default Page3;
