import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";

export function CopyButton({ onCopy, tooltip }: { onCopy: () => void; tooltip?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    const Icon = copied ? CheckIcon : CopyIcon;

    return (
        <button
            onClick={handleCopy}
            className="cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1"
            title={tooltip}
        >
            <Icon size={14} />
        </button>
    );
}
