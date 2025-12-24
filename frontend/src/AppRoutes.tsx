import { Route, Routes } from "react-router";
import DataConnectorsPage from "./pages/dataConnector/DataConnectorsPage";
import ChatsPage from "./pages/chats/ChatsPage";
import ChatRoute from "./pages/chats/ChatRoute";
import FilesPage from "./pages/FilesPage";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoutes";
import LoginForm from "./pages/Login";
// dynamic chats now driven by backend; no static sessions

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
            <ChatsPage chatId="new-chat" initialMessages={[]} image_dict={{}} />
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

      {/* Chat route */}
      <Route
        path="/chats/:chatId"
        element={
          <ProtectedRoute>
            <ChatRoute />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
