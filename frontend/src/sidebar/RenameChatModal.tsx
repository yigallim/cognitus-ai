import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RenameChatModal({
  open,
  onOpenChange,
  initialTitle = "Chat",
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  onSubmit: (newTitle: string) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, open]);

  function handleConfirm() {
    const newTitle = title.trim() || "Chat";
    onSubmit(newTitle);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a chat title"
            aria-label="Chat title"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
