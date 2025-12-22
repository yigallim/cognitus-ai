import type { CodeOutput } from "@/pages/chats/ExpandedCodeBlock";
import { Download } from "lucide-react";

function ImageOutput({ currentItem }: { currentItem: CodeOutput }) {
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
    return (
        <div className="my-4 first:mt-0 whitespace-pre-wrap">
            <span className="flex relative flex-col gap-1 items-start w-full">
                <span className="flex relative flex-row gap-1 self-end w-F">
                    <button
                        className="font-medium border items-center justify-center px-2 py-1 hover:bg-muted/80 rounded-md flex gap-1"
                        onClick={() => downloadFile(currentItem.content as string, currentItem.title || "image_output.png")}
                    >
                        <Download className="size-4" />
                        <span className="text-xs">Download</span>
                    </button>
                </span>

                <img
                    src={currentItem.content as string}
                    alt={currentItem.title || "Image Output"}
                    className="mt-0 w-full transition-transform duration-300 ease-in-out transform"
                />
            </span>
        </div>
    );
}

export default ImageOutput;