import type { CodeOutput } from "@/pages/chats/ExpandedCodeBlock";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef } from "react";

function ImageOutput({ currentItem }: { currentItem: CodeOutput }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const downloadFile = async (content: string, filename: string) => {
    // Case 1: Base64 data URI
    if (content.startsWith("data:")) {
      const [meta, data] = content.split(",");
      const mime = meta.match(/:(.*?);/)![1];
      const bstr = atob(data);

      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);

      return triggerDownload(new Blob([u8arr], { type: mime }), filename);
    }

    // Case 2: Blob URL
    if (content.startsWith("blob:")) {
      const res = await fetch(content);
      const blob = await res.blob();
      return triggerDownload(blob, filename);
    }

    // Case 3: regular URL
    const response = await fetch(content);
    const blob = await response.blob();

    return triggerDownload(blob, filename);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = blobUrl;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(blobUrl);
  };

  const clampScale = (value: number) => Math.min(5, Math.max(0.25, value));
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => clampScale(s + delta));
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setDragging(true);
    dragStartRef.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !dragStartRef.current) return;
    setTranslate({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };
  const endDrag = () => {
    setDragging(false);
    dragStartRef.current = null;
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div className="my-4 first:mt-0 whitespace-pre-wrap">
      <span className="flex relative flex-col gap-1 items-center w-full">
        <span className="flex relative flex-row gap-1 self-end">
          <button
            className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
            onClick={() =>
              downloadFile(currentItem.content as string, currentItem.title || "image_output.png")
            }
          >
            <Download className="size-4" />
            <span className="text-xs">Download</span>
          </button>
          <button
            className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
            onClick={() => setIsOpen(true)}
          >
            <ZoomIn className="size-4" />
            <span className="text-xs">View</span>
          </button>
        </span>

        <img
          src={currentItem.content as string}
          alt={currentItem.title || "Image Output"}
          className="max-w-[680px] mt-0 transition-transform duration-300 ease-in-out transform"
        />

        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v);
            if (!v) resetView();
          }}
        >
          <DialogContent className="sm:max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>{currentItem.title || "Image Preview"}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <button
                  className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
                  onClick={() => setScale((s) => clampScale(s + 0.2))}
                >
                  <ZoomIn className="size-4" />
                  <span className="text-xs">Zoom In</span>
                </button>
                <button
                  className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
                  onClick={() => setScale((s) => clampScale(s - 0.2))}
                >
                  <ZoomOut className="size-4" />
                  <span className="text-xs">Zoom Out</span>
                </button>
                <button
                  className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
                  onClick={resetView}
                >
                  <RotateCcw className="size-4" />
                  <span className="text-xs">Reset</span>
                </button>
              </div>
              <div className="text-xs opacity-70">Scale: {scale.toFixed(2)}x</div>
            </div>

            <div
              className={`relative w-full h-[70vh] overflow-hidden border rounded-md ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onWheel={handleWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              <img
                src={currentItem.content as string}
                alt={currentItem.title || "Image Preview"}
                draggable={false}
                className="select-none pointer-events-none max-w-none"
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </span>
    </div>
  );
}

export default ImageOutput;
