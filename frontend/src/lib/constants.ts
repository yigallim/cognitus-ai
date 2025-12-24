import type { FileUIPart } from "ai";

export const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".json", ".txt", ".md", ".pdf"];
export const ACCEPT_STRING = ALLOWED_EXTENSIONS.join(",");

interface UserMessage {
  id: string;
  role: "user";
  content: string;
  attachments?: FileUIPart[];
}

interface AssistantMessage {
  id: string;
  role: "assistant";
  content?: string;
  function_call?: {
    name: string;
    content: string;
  };
  attachments?: FileUIPart[];
}

interface FunctionMessage {
  id: string;
  role: "function";
  name: string;
  belongsTo: string;
  output: string;
}

export type ChatMessage = UserMessage | AssistantMessage | FunctionMessage;

const image_dict: Record<string, string> = {
  xbl9ls3909txdouu:
    "https://scikit-learn.org/stable/_images/sphx_glr_plot_release_highlights_1_5_0_001.png",
};

export interface ChatHistoryItem {
  id: string;
  title: string;
  url: string;
  messages: ChatMessage[];
  image_dict: Record<string, string>;
}
const chatHistory1: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "This is history of Chats Page 1.",
  },
  {
    id: "2",
    role: "assistant",
    content: `## Rules of Hooks
1. Only call hooks at the **top level** (not inside loops, conditions, or nested functions)
2. Only call hooks from **React functions** (components or custom hooks)
\nWould you like to explore more advanced hooks like \`useCallback\` or \`useMemo\`?
\nReact hooks are special functions that let you use React features in function components. The most common ones are:
- **useState** - for managing component state
- **useEffect** - for side effects like data fetching
- **useContext** - for consuming context values
- **useRef** - for accessing DOM element
\`\`\`sql
SELECT customers.name, orders.order_date, orders.total_amount
FROM customers
JOIN orders ON customers.id = orders.customer_id
WHERE orders.total_amount > 100
ORDER BY orders.order_date DESC;
\`\`\`
`
  },
];
const chatHistory2: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "This is history of Chats Page 2.",
  },
  {
    id: "2",
    role: "assistant",
    content: `This is example codes.\n\n
\`\`\`python
# Load labelled.csv and do an initial inspection
import pandas as pd
from tqdm import tqdm

labelled_df = pd.read_csv('labelled.csv', encoding='ascii')
print(labelled_df.head())
print(labelled_df.describe(include='all'))
\`\`\`
\nImage using dictionary:\n
<image-tag>xbl9ls3909txdouu</image-tag>
Simple Table:
| Header 1 | Header 2 | Header 3 | Header 3 |
|---|---|---|---|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 | Row 1, Col 4 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 | Row 2, Col 4 |
\n\nAnd here is an image:\n\n
![Image](https://i.postimg.cc/Mp3ZXpdm/image.png)`,
  },
];

const chatHistory3: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Calculate the mean fare paid by the passengers.",
  },
  {
    id: "2",
    role: "assistant",
    function_call: {
      name: "execute_code",
      content: `# Importing necessary libraries
import pandas as pd

# Load the dataset
file_path = './input/test_ave.csv'
data = pd.read_csv(file_path)

# Display the first few rows of the dataset to understand its structure
data.head()`,
    },
  },
  {
    id: "3",
    role: "assistant",
    function_call: {
      name: "execute_code",
      content: `# Calculate the mean fare paid by the passengers
mean_fare = data['Fare'].mean()  # Using the correct column name
mean_fare_rounded = round(mean_fare, 2)

mean_fare_rounded`,
    },
  },
  {
    id: "4",
    role: "function",
    name: "run_code",
    belongsTo: "2",
    output: `{
  "[table]-2d0c2b2b": {
    "columns": [
      "PassengerId",
      "Survived",
      "Pclass",
      "Name",
      "Sex",
      "Age",
      "SibSp",
      "Parch",
      "Ticket",
      "Fare",
      "Cabin",
      "Embarked",
      "AgeBand"
    ],
    "data": [
      ["1", "0", "3", "Braund, Mr. Owen Harris", "male", "22.0", "1", "0", "A/5 21171", "7.25", "NaN", "S", "2"],
      ["2", "1", "1", "Cumings, Mrs. John Bradley (Florence Briggs Thayer)", "female", "38.0", "1", "0", "PC 17599", "71.2833", "C85", "C", "3"],
      ["3", "1", "3", "Heikkinen, Miss. Laina", "female", "26.0", "0", "0", "STON/O2. 3101282", "7.925", "NaN", "S", "2"],
      ["4", "1", "1", "Futrelle, Mrs. Jacques Heath (Lily May Peel)", "female", "35.0", "1", "0", "113803", "53.1", "C123", "S", "3"],
      ["5", "0", "3", "Allen, Mr. William Henry", "male", "35.0", "0", "0", "373450", "8.05", "NaN", "S", "3"]
    ]
  }
}`,
  },
  {
    id: "5",
    role: "function",
    name: "run_code",
    belongsTo: "3",
    output: `{ "[text]-2573c8b1": "34.65", "[image]-2573c8b2": "xbl9ls3909txdouu",
    "[table]-2573c8b1": {
    "columns": [
      "Header 1", "Header 2", "Header 3", "Header 4", "Header 5", "Header 6",
      "Header 7", "Header 8", "Header 9", "Header 10", "Header 11", "Header 12",
      "Header 13"
    ],
    "data": [
      ["1", "0", "3", "Braund, Mr. Owen Harris", "male", "22.0", "1", "0", "A/5 21171", "7.25", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["2", "1", "1", "Cumings, Mrs. John Bradley (Florence Briggs Thayer)", "female", "38.0", "1", "0", "PC 17599", "71.2833", "C85", "C", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["3", "1", "3", "Heikkinen, Miss. Laina", "female", "26.0", "0", "0", "STON/O2. 3101282", "7.925", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["4", "1", "1", "Futrelle, Mrs. Jacques Heath (Lily May Peel)", "female", "35.0", "1", "0", "113803", "53.1", "C123", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["5", "0", "3", "Allen, Mr. William Henry", "male", "35.0", "0", "0", "373450", "8.05", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["1", "0", "3", "Braund, Mr. Owen Harris", "male", "22.0", "1", "0", "A/5 21171", "7.25", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["2", "1", "1", "Cumings, Mrs. John Bradley (Florence Briggs Thayer)", "female", "38.0", "1", "0", "PC 17599", "71.2833", "C85", "C", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["3", "1", "3", "Heikkinen, Miss. Laina", "female", "26.0", "0", "0", "STON/O2. 3101282", "7.925", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["4", "1", "1", "Futrelle, Mrs. Jacques Heath (Lily May Peel)", "female", "35.0", "1", "0", "113803", "53.1", "C123", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["5", "0", "3", "Allen, Mr. William Henry", "male", "35.0", "0", "0", "373450", "8.05", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"]
    ]
  }, 
    "[image]-2573c8b1": "https://i.postimg.cc/Mp3ZXpdm/image.png" }`
  },
  {
    id: "6",
    role: "assistant",
    function_call: {
      name: "execute_sql",
      content: `SELECT customers.name, orders.order_date, orders.total_amount
FROM customers
JOIN orders ON customers.id = orders.customer_id
WHERE orders.total_amount > 100
ORDER BY orders.order_date DESC;`
    }
  },
  {
    id: "7",
    role: "function",
    name: "run_code",
    belongsTo: "6",
    output: `{ 
    "[table]-1245bg18": {
    "columns": [
      "Header 1", "Header 2", "Header 3", "Header 4", "Header 5", "Header 6",
      "Header 7", "Header 8", "Header 9", "Header 10", "Header 11", "Header 12",
      "Header 13"
    ],
    "data": [
      ["1", "0", "3", "Braund, Mr. Owen Harris", "male", "22.0", "1", "0", "A/5 21171", "7.25", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["2", "1", "1", "Cumings, Mrs. John Bradley (Florence Briggs Thayer)", "female", "38.0", "1", "0", "PC 17599", "71.2833", "C85", "C", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["3", "1", "3", "Heikkinen, Miss. Laina", "female", "26.0", "0", "0", "STON/O2. 3101282", "7.925", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["4", "1", "1", "Futrelle, Mrs. Jacques Heath (Lily May Peel)", "female", "35.0", "1", "0", "113803", "53.1", "C123", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["5", "0", "3", "Allen, Mr. William Henry", "male", "35.0", "0", "0", "373450", "8.05", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["1", "0", "3", "Braund, Mr. Owen Harris", "male", "22.0", "1", "0", "A/5 21171", "7.25", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["2", "1", "1", "Cumings, Mrs. John Bradley (Florence Briggs Thayer)", "female", "38.0", "1", "0", "PC 17599", "71.2833", "C85", "C", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["3", "1", "3", "Heikkinen, Miss. Laina", "female", "26.0", "0", "0", "STON/O2. 3101282", "7.925", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["4", "1", "1", "Futrelle, Mrs. Jacques Heath (Lily May Peel)", "female", "35.0", "1", "0", "113803", "53.1", "C123", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"],
      ["5", "0", "3", "Allen, Mr. William Henry", "male", "35.0", "0", "0", "373450", "8.05", "NaN", "S", "4cb9bafe-0b77-40d6-9efe-00b44f07f478.ipynb"]
    ]
  } }`
  },
  {
    id: "8",
    role: "assistant",
    content: `
# Summary of the Analysis
The task was to calculate the mean fare paid by passengers using the dataset \`test_ave.csv\`. The following steps were taken to achieve this:

1. **Data Loading**: The dataset was successfully loaded into a pandas DataFrame.
2. **Mean Calculation**: The mean fare was calculated using the 'Fare' column from the dataset.
3. **Rounding**: The result was rounded to two decimal places.

## Result
The mean fare paid by the passengers is **34.65**.

If you have any further questions or need additional analysis, feel free to ask!
`,
  },
];

export const CHAT_SESSIONS: ChatHistoryItem[] = [
  {
    id: "1",
    title: "Chat 1",
    url: "/05f60180-6d3c-4590-b659-81b4592f71ec",
    messages: chatHistory1,
    image_dict: image_dict,
  },
  {
    id: "2",
    title: "Chat 2",
    url: "/c952df0b-75be-4b1f-b094-00902ac744d3",
    messages: chatHistory2,
    image_dict: image_dict,
  },
  {
    id: "3",
    title: "Chat 3",
    url: "/3d960391-be5b-45e1-a674-834db7c67518",
    messages: chatHistory3,
    image_dict: image_dict,
  },
];
