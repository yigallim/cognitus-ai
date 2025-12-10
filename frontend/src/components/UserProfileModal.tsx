import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError("");
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load user profile");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, setUser]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif font-semibold">User Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : user ? (
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right">Username:</span>
                <span className="col-span-3">{user.username}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right">Email:</span>
                <span className="col-span-3">{user.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right">Role:</span>
                <span className="col-span-3 capitalize">{user.role}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right">Status:</span>
                <span className="col-span-3">
                  {user.is_active ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right">ID:</span>
                <span className="col-span-3 text-xs text-muted-foreground break-all">
                  {user.id}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
