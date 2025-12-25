import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Database, FileCode, FileIcon, FileJson, FileSpreadsheet, FileText } from "lucide-react";

export type MentionItem = {
    id: string;
    name: string;
    type: "file" | "database" | string;
    category: "Files" | "Databases";
    originalData?: any; // store original object for real files / db info
};

interface MentionsMenuProps {
    suggestions: MentionItem[];
    activeIndex: number;
    onSelect: (item: MentionItem) => void;
    onClose: () => void;
}

function MentionsMenu({ suggestions, activeIndex, onSelect }: MentionsMenuProps) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        // The list children correspond 1:1 to the suggestions because of the map below
        const activeElement = list.children[activeIndex] as HTMLElement;

        if (activeElement) {
            const { offsetTop, offsetHeight } = activeElement;
            const { scrollTop, clientHeight } = list;

            // 1. If element is above the visible area, scroll up
            if (offsetTop < scrollTop) {
                list.scrollTop = offsetTop;
            } 
            // 2. If element is below the visible area, scroll down
            else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
                list.scrollTop = offsetTop + offsetHeight - clientHeight;
            }
        }
    }, [activeIndex]);

    if (suggestions.length === 0) return null;

    const getAttachmentIcon = (filename: string) => {
        const extension = filename.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "pdf":
                return FileIcon;
            case "csv":
            case "xlsx":
                return FileSpreadsheet;
            case "json":
                return FileJson;
            case "md":
            case "txt":
                return FileText;
            default:
                return FileCode;
        };
    }

    return (
        <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in slide-in-from-bottom-2 z-50">
            <div 
                ref={listRef}
                className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-zinc-950" 
                style={{ scrollbarWidth: "thin" }}
            >
                {suggestions.map((item, index) => {
                    const showHeader = index === 0 || suggestions[index - 1].category !== item.category;
                    const isActive = index === activeIndex;

                    const AttachmentIcon = item.category === "Databases" ? Database : getAttachmentIcon(item.name);
                    const iconColor = item.category === "Databases" ? "text-green-500" : "text-blue-500";

                    return (
                        <div key={item.id}>
                            {showHeader && (
                                <div className="text-center px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30">
                                    {item.category}
                                </div>
                            )}
                            <button
                                onClick={() => onSelect(item)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer text-left transition-colors",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <AttachmentIcon className={cn("size-4 shrink-0", iconColor)} />
                                <span className="truncate">{item.name}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MentionsMenu;