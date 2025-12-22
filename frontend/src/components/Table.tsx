import { TableCopyDropdown } from "./table-function/copy-dropdown";
import { TableDownloadDropdown } from "./table-function/download-dropdown";

export interface TableData {
    columns: string[];
    data: string[][];
}

interface DataTableProps {
    table: TableData;
    longTable?: boolean;
}

export function DataTable({ table, longTable = false }: DataTableProps) {
    const rows = table.data ?? [];
    const cols = table.columns ?? [];

    return (
        <div className="border border-border rounded-xl w-full overflow-hidden" data-streamdown="table-wrapper">
            {/* Header with row/col count and action buttons */}
            <div className="flex flex-row justify-between items-center px-3 h-10 bg-gray-100 dark:bg-neutral-900 border-b border-border shrink-0">
                <span className="text-xs font-medium text-muted-foreground tracking-tight whitespace-nowrap">
                    {cols.length} cols, {rows.length} rows returned
                </span>

                <div className="flex items-center gap-1">
                    <TableDownloadDropdown
                        onDownload={(format) => {
                            console.log(`Table downloaded as ${format}`);
                        }}
                        onError={(error) => {
                            console.error('Download failed:', error);
                        }}
                    />
                    <TableCopyDropdown
                        onCopy={(format) => {
                            console.log(`Table copied as ${format}`);
                        }}
                        onError={(error) => {
                            console.error('Copy failed:', error);
                        }}
                    />
                </div>
            </div>

            {/* Scrollable table container */}
            <div
                className={`overflow-auto ${longTable ? "max-h-[calc(100vh-10rem)]" : "max-h-[500px]"} bg-white dark:bg-neutral-950`}
                style={{ scrollbarWidth: "thin" }}
            >
                <table className="border-collapse text-sm w-auto min-w-full">
                    <thead className="sticky top-0 z-30 bg-gray-100 dark:bg-neutral-900">
                        <tr>
                            {/* Corner cell for row numbers */}
                            <th className="sticky left-0 z-40 bg-gray-100 dark:bg-neutral-900 p-2 border-b-2 border-r-2 border-border min-w-8"></th>

                            {/* Column headers */}
                            {cols.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="p-2 bg-gray-100 dark:bg-neutral-900 font-medium border-b-2 border-r-2 last:border-r-0 border-border group relative z-20"
                                    style={{ minWidth: '150px', maxWidth: '400px' }}
                                >
                                    <div className="flex items-center justify-center">
                                        <span
                                            className="text-xs break-words hyphens-auto"
                                            style={{ wordBreak: 'break-word' }}
                                            title={col}
                                        >
                                            {col}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr
                                key={rIdx}
                                className="hover:bg-gray-50 dark:hover:bg-neutral-900/50"
                            >
                                {/* Row number cell - sticky on left */}
                                <td className="sticky left-0 z-10 bg-gray-100 dark:bg-neutral-900 p-2 text-xs border-b border-r-2 border-border group align-center min-w-8">
                                    <div className="flex items-center justify-center">
                                        <span className="text-muted-foreground">{rIdx + 1}</span>
                                    </div>
                                </td>

                                {/* Data cells with text wrapping */}
                                {row.map((cell, cIdx) => (
                                    <td
                                        key={cIdx}
                                        className="p-2 text-xs border-b border-r last:border-r-0 border-border bg-white dark:bg-neutral-950 align-top relative z-0"
                                        style={{ minWidth: '150px', maxWidth: '400px' }}
                                    >
                                        <div
                                            className="break-words hyphens-auto leading-relaxed"
                                            style={{ wordBreak: 'break-word' }}
                                        >
                                            {cell ?? ""}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
