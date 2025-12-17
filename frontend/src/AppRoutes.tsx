import { Route, Routes } from "react-router";
import DataConnectorsPage from "./pages/dataConnector/DataConnectorsPage";
import ChatsPage from "./pages/chats/ChatsPage";
import FilesPage from "./pages/FilesPage";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoutes";
import LoginForm from "./pages/Login";

// temp
import { type UIMessage } from "ai";

function AppRoutes() {
  const initialMessages1: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "This is history of Chats Page 1.",
        },
      ],
    },
    {
      id: "2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `
## Rules of Hooks
1. Only call hooks at the **top level** (not inside loops, conditions, or nested functions)
2. Only call hooks from **React functions** (components or custom hooks)
\nWould you like to explore more advanced hooks like \`useCallback\` or \`useMemo\`?
\nReact hooks are special functions that let you use React features in function components. The most common ones are:
- **useState** - for managing component state
- **useEffect** - for side effects like data fetching
- **useContext** - for consuming context values
- **useRef** - for accessing DOM elements
        `,
        },
      ],
    },
  ];

  const initialMessages2: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "This is history of Chats Page 2.",
        },
      ],
    },
    {
      id: "2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `
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
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 | Row 2, Col 4 |
`,
        },
      ],
    },
  ];

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatsPage initialMessages={[]} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-connectors"
        element={
          <ProtectedRoute>
            <DataConnectorsPage />
          </ProtectedRoute>
        }
      />

      {/* temporary route for testing */}
      <Route
        path="/chat1"
        element={
          <ProtectedRoute>
            <ChatsPage initialMessages={initialMessages1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat2"
        element={
          <ProtectedRoute>
            <ChatsPage initialMessages={initialMessages2} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
