import { useLayoutEffect, useRef, useState } from "react";
import { TableCopyDropdown } from "./table-function/copy-dropdown";
import { TableDownloadDropdown } from "./table-function/download-dropdown";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

    const CELL_MIN_WIDTH = 80;
    const CELL_MAX_WIDTH = 400;

    const isTextTruncated = (el: HTMLDivElement | null) => {
        if (!el) return false;
        return el.scrollWidth > el.clientWidth;
    }

    const [rowsWithOverflow, setRowsWithOverflow] = useState<Set<number>>(new Set());
    const [overflowingCells, setOverflowingCells] = useState<Set<string>>(new Set());
    const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);

    useLayoutEffect(() => {
        const newRowSet = new Set<number>();
        const newCellSet = new Set<string>();

        rows.forEach((_, rIdx) => {
            let rowHasTruncation = false;
            cols.forEach((_, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const el = cellRefs.current[key];
                if (isTextTruncated(el)) {
                    rowHasTruncation = true;
                    newCellSet.add(key);
                }
            });
            if (rowHasTruncation) {
                newRowSet.add(rIdx);
            }
        });

        setRowsWithOverflow(newRowSet);
        setOverflowingCells(newCellSet);
    }, [rows, cols, table]);

    const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set());
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleColumn = (colIndex: number) => {
        setExpandedColumns((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(colIndex)) newSet.delete(colIndex);
            else newSet.add(colIndex);
            return newSet;
        });
    };

    const toggleRow = (rowIndex: number) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) newSet.delete(rowIndex);
            else newSet.add(rowIndex);
            return newSet;
        });
    };

    const isColumnExpanded = (colIndex: number) => expandedColumns.has(colIndex);
    const isRowExpanded = (rowIndex: number) => expandedRows.has(rowIndex);

    return (
        <div 
            className="border border-border rounded-xl w-full overflow-hidden" 
            data-streamdown="table-wrapper"
            onMouseLeave={() => setHoveredCol(null)} 
        >
            <div className="flex flex-row justify-between items-center px-3 h-10 bg-gray-100 dark:bg-neutral-900 border-b border-border shrink-0">
                <span className="text-xs font-medium text-muted-foreground tracking-tight whitespace-nowrap">
                    {cols.length} cols, {rows.length} rows returned
                </span>

                <div className="flex items-center gap-1">
                    <TableDownloadDropdown
                        onDownload={(format) => console.log(`Table downloaded as ${format}`)}
                        onError={(error) => console.error('Download failed:', error)}
                    />
                    <TableCopyDropdown
                        onCopy={(format) => console.log(`Table copied as ${format}`)}
                        onError={(error) => console.error('Copy failed:', error)}
                    />
                </div>
            </div>

            <div
                className={`overflow-auto ${longTable ? "max-h-[calc(100vh-10rem)]" : "max-h-[500px]"} bg-white dark:bg-neutral-950`}
                style={{ scrollbarWidth: "thin" }}
            >
                <table className="border-collapse text-sm min-w-full">
                    <thead className="sticky top-0 z-30 bg-gray-100 dark:bg-neutral-900 shadow-sm">
                        <tr>
                            <th className="sticky left-0 z-40 bg-gray-100 dark:bg-neutral-900 p-0 border-b border-r border-border w-12 min-w-[3rem]"></th>
                            
                            {cols.map((col, idx) => {
                                const colExpanded = isColumnExpanded(idx);
                                const isHovered = hoveredCol === idx;

                                return (
                                    <th
                                        key={idx}
                                        onMouseEnter={() => setHoveredCol(idx)}
                                        className="p-2 bg-gray-100 dark:bg-neutral-900 font-medium border-b border-r last:border-r-0 border-border group relative z-20 align-top text-left"
                                        style={{ width: 'auto' }}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div
                                                className={cn(
                                                    "text-xs block",
                                                    colExpanded 
                                                        ? "whitespace-normal break-words" 
                                                        : "whitespace-nowrap overflow-hidden text-ellipsis"
                                                )}
                                                style={{
                                                    minWidth: CELL_MIN_WIDTH,
                                                    maxWidth: CELL_MAX_WIDTH,
                                                    width: colExpanded ? CELL_MAX_WIDTH : "auto", 
                                                }}
                                                title={col}
                                            >
                                                {col}
                                            </div>

                                            <Button 
                                                variant="ghost" 
                                                className={cn(
                                                    "h-4 w-4 p-0 shrink-0 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-opacity",
                                                    (colExpanded || isHovered) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                )}
                                                onClick={() => toggleColumn(idx)}
                                            >
                                                <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-200", colExpanded ? "rotate-90" : "")} />
                                            </Button>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, rIdx) => {
                            const rowExpanded = isRowExpanded(rIdx);
                            const canExpand = rowsWithOverflow.has(rIdx);

                            return (
                                <tr
                                    key={rIdx}
                                    className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 group/row"
                                >
                                    <td className="sticky left-0 z-10 bg-gray-100 dark:bg-neutral-900 p-2 text-xs border-b border-r border-border w-12 min-w-[3rem] align-top">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-muted-foreground">{rIdx + 1}</span>
                                            {canExpand && (
                                                <Button 
                                                    variant="ghost" 
                                                    className={cn(
                                                        "h-4 w-4 p-0 shrink-0 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-opacity",
                                                        rowExpanded ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                                                    )}
                                                    onClick={() => toggleRow(rIdx)}
                                                >
                                                    <ChevronRight className={cn("size-3 text-muted-foreground transition-transform duration-200", rowExpanded ? "rotate-90" : "")} />
                                                </Button>
                                            )}
                                        </div>
                                    </td>

                                    {row.map((cell, cIdx) => {
                                        const cellContent = cell ?? "";
                                        const colExpanded = isColumnExpanded(cIdx);
                                        const isTruncated = overflowingCells.has(`${rIdx}-${cIdx}`);
                                        
                                        const isColTriggered = colExpanded;
                                        const isRowTriggered = rowExpanded && isTruncated;
                                        const shouldExpand = isColTriggered || isRowTriggered;

                                        return (
                                            <td
                                                key={cIdx}
                                                onMouseEnter={() => setHoveredCol(cIdx)}
                                                className="p-2 text-xs border-b border-r last:border-r-0 border-border bg-white dark:bg-neutral-950 align-top"
                                            >
                                                <div
                                                    ref={(el) => { cellRefs.current[`${rIdx}-${cIdx}`] = el; }}
                                                    className={cn(
                                                        "leading-relaxed block",
                                                        shouldExpand
                                                            ? "whitespace-normal break-words" 
                                                            : "whitespace-nowrap overflow-hidden text-ellipsis"
                                                    )}
                                                    style={{
                                                        minWidth: CELL_MIN_WIDTH,
                                                        maxWidth: CELL_MAX_WIDTH,
                                                        width: shouldExpand ? CELL_MAX_WIDTH : "auto",
                                                    }}
                                                    title={cellContent}
                                                >
                                                    {cellContent}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}