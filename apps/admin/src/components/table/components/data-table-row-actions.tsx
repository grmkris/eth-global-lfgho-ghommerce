"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import  {ReactNode} from "react";

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (input: TData) => void;
  onDelete?: (id: TData) => void;
  onOpen?: (input: TData) => void;
  customActions?: {
    label: string;
    onClick: (row: TData) => void;
  }[];
  customElements?: (input: TData) => ReactNode
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onOpen,
  customActions,
    customElements,
}: DataTableRowActionsProps<TData>) {
  console.log("customElements", customElements)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
        )}
        {onOpen && (
          <DropdownMenuItem onClick={() => onOpen(row.original)}>
            Open
          </DropdownMenuItem>
        )}
        {customActions?.map((action) => {
          return (
            <DropdownMenuItem onClick={() => action.onClick(row.original)}>
              {action.label}
            </DropdownMenuItem>
          );
        })}
        {customElements?.(row.original)}
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        {onDelete && (
          <DropdownMenuItem onClick={() => onDelete(row.original)}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
