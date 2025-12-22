import { ChevronLeft, ChevronRight, Download, XIcon } from "lucide-react";
import { SheetClose, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import type { CodeOutput } from "@/pages/chats/ExpandedCodeBlock";
import { getOutputBoxItem } from "./ai-elements/tool";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DataTable } from "./Table";
import { MessageResponse } from "./ai-elements/message";

export type OutputTabProps = {
    item: CodeOutput;
    allOutputItems?: CodeOutput[];
};

function OutputTab({ item, allOutputItems }: OutputTabProps) {
    const index = allOutputItems ? allOutputItems.indexOf(item) : 0;
    const [currentIndex, setCurrentIndex] = useState(index);
    const [currentItem, setCurrentItem] = useState(item);

    function handleChanging(direction: "next" | "prev") {
        let newIndex = currentIndex;
        if (direction === "next") {
            newIndex = (currentIndex + 1) % (allOutputItems ? allOutputItems.length : 1);
        } else {
            newIndex = (currentIndex - 1 + (allOutputItems ? allOutputItems.length : 1)) % (allOutputItems ? allOutputItems.length : 1);
        }
        setCurrentIndex(newIndex);
        if (allOutputItems) {
            setCurrentItem(allOutputItems[newIndex]);
        }
    }

    function handleClickItem(selectedItem: CodeOutput) {
        if (allOutputItems) {
            const newIndex = allOutputItems.indexOf(selectedItem);
            setCurrentIndex(newIndex);
            setCurrentItem(selectedItem);
        }
    }

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
        <>
            <SheetHeader className="bg-muted border-b">
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
                <div className="flex items-center gap-4 px-2 pb-3 pt-1 justify-between w-full">
                    {allOutputItems && allOutputItems.length > 1 ? (
                        <div className="flex items-center gap-2">
                            <button
                                className="whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 duration-100 active:opacity-80 active:shadow-none border text-foreground dark:text-white border-input hover:dark:bg-accent hover:text-accent-foreground size-8 flex-shrink-0 flex flex-shrink-0 items-center justify-center rounded-full w-9 h-9 p-0 active:scale-95"
                                title="Previous"
                                onClick={() => handleChanging("prev")}
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <button
                                className="whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 duration-100 active:opacity-80 active:shadow-none border text-foreground dark:text-white border-input hover:dark:bg-accent hover:text-accent-foreground size-8 flex-shrink-0 flex flex-shrink-0 items-center justify-center rounded-full w-9 h-9 p-0 active:scale-95"
                                title="Next"
                                onClick={() => handleChanging("next")}
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </div>
                    ) : null}
                    <div className="flex flex-nowrap overflow-x-auto gap-2 w-full">
                        {allOutputItems?.map((outputItem, index) => {
                            const isActive = outputItem === currentItem;
                            const { icon: Icon, title } = getOutputBoxItem({ item: outputItem });

                            return (
                                <div key={index}
                                    className={cn("flex border rounded-xl overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors w-fit min-w-[160px] bg-white group transition-all duration-200 active:scale-95",
                                        isActive ? "border-gray-500" : ""
                                    )}
                                    onClick={() => handleClickItem(outputItem)}
                                >
                                    <div className={cn("bg-muted px-4 py-2 flex items-center justify-center border-r group-hover:bg-muted/80", isActive ? "border-r-gray-500" : "")}>
                                        <Icon className="size-6 text-muted-foreground" />
                                    </div>
                                    <div className="px-3 py-2 flex flex-col justify-center">
                                        <span className="text-sm font-semibold text-gray-800">{title}</span>
                                        <span className="text-[11px] text-gray-400 font-medium">Click to view</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <SheetClose className="whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 duration-100 active:opacity-80 active:shadow-none border text-foreground dark:text-white border-input hover:dark:bg-accent hover:text-accent-foreground size-8 flex-shrink-0 flex flex-shrink-0 items-center justify-center rounded-full w-9 h-9 p-0 active:scale-95">
                        <XIcon className="size-4" />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col overflow-auto w-full p-4 pt-1 bg-background">
                <div className="w-full max-w-full justify-center items-start">
                    {currentItem.type === "table" && (
                        <DataTable table={currentItem.content as any} longTable={true} />
                    )}
                    {currentItem.type === "text" && (
                        <span className="w-full text-sm">
                            <MessageResponse className="whitespace-pre-wrap break-words text-sm font-mono text-foreground [&_p]:my-4 [&_p]:first:mt-0">
                                {currentItem.content as string}
                            </MessageResponse>
                        </span>
                    )}
                    {(currentItem.type === "image" || currentItem.type === "chart") && (
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
                    )}
                </div>
            </div>
        </>
    );
}

export default OutputTab;