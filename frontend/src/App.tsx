import "./App.css";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import AppLayout from "./AppLayout";
import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  if (!isHydrated) return null;

  return (
    <>
      {isAuthenticated ? (
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      ) : (
        <AppRoutes />
      )}
      <Toaster />
    </>
  );
}

export default App;
