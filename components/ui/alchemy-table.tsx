import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type AlchemyTableColumn = {
  label: string;
  align?: "left" | "center" | "right";
};

export type AlchemyTableRow = {
  key: string;
  cells: ReactNode[];
  /**
   * Per-cell className overrides. Omit an entry (or pass `undefined`) to use
   * the default: `text-foreground/80` for normal rows, `text-foreground` for
   * highlighted rows.
   */
  cellClassNames?: (string | undefined)[];
  /** Highlights the row with a primary tint (used for the "our product" row). */
  highlight?: boolean;
};

interface AlchemyTableProps {
  columns: AlchemyTableColumn[];
  rows: AlchemyTableRow[];
  /** Hide the header row entirely. Useful for label/detail grid-style tables. */
  showHeader?: boolean;
  className?: string;
}

const alignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function AlchemyTable({
  columns,
  rows,
  showHeader = true,
  className,
}: AlchemyTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-foreground/15 bg-background/90 backdrop-blur-sm",
        className,
      )}
    >
      <table className="w-full text-sm">
        {showHeader && (
          <thead>
            <tr className="border-b border-foreground/15 bg-foreground/5">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-4 py-3 font-medium text-foreground/75",
                    alignClass[col.align ?? "left"],
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.key}
              className={cn(
                "border-b border-foreground/10 transition-colors last:border-b-0",
                row.highlight
                  ? "bg-primary/15"
                  : rowIndex % 2 === 0
                    ? "hover:bg-foreground/[0.03]"
                    : "bg-foreground/[0.04] hover:bg-foreground/[0.07]",
              )}
            >
              {row.cells.map((cell, cellIndex) => {
                const override = row.cellClassNames?.[cellIndex];
                return (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-4 py-3",
                      alignClass[columns[cellIndex]?.align ?? "left"],
                      override !== undefined
                        ? override
                        : row.highlight
                          ? "text-foreground"
                          : "text-foreground/80",
                    )}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
