import { Route, Routes } from "react-router";
import DataConnectorsPage from "./pages/dataConnector/DataConnectorsPage";
import ChatsPage from "./pages/chats/ChatsPage";
import FilesPage from "./pages/FilesPage";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoutes";
import LoginForm from "./pages/Login";
import { CHAT_SESSIONS } from "./lib/constants";

function AppRoutes() {
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
            <ChatsPage chatId="new-chat" initialMessages={[]} />
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

      {/* Dynamic chat routes from constants */}
      {CHAT_SESSIONS.map((session) => (
        <Route
          key={session.id}
          path={session.url}
          element={
            <ProtectedRoute>
              <ChatsPage chatId={session.id} initialMessages={session.messages} />
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
}

export default AppRoutes;
