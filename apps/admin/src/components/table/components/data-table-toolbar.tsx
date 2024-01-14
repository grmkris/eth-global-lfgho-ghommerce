"use client";

import { DataTableViewOptions } from "@/components/table/components/data-table-view-options.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { FilterConfig } from "@/routes/createEntityRouter.tsx";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterableCols?: FilterConfig<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  filterableCols,
}: Readonly<DataTableToolbarProps<TData>>) {
  console.log("DataTableToolbar", { filterableCols });
  const isFiltered = table.getState().columnFilters.length > 0;
  const filteredColumns = filterableCols
    ? filterableCols.map((column) => {
        return {
          id: column.id,
          title: column.id,
          options: column.options
            ? column.options.map((option) => ({
                ...option,
                icon: option.icon ?? CheckIcon,
              }))
            : Array.from(
                table.getColumn(column.id)?.getFacetedUniqueValues() ?? [],
              )?.map(([value]) => ({
                label: value,
                value,
                icon: CheckIcon,
              })),
        };
      })
    : table
        .getAllColumns()
        .filter((column) => {
          const canFilter = column.getCanFilter();
          console.log("getCanFilter", { canFilter: canFilter, id: column.id });
          return canFilter;
        })
        .map((column) => {
          const options = Array.from(column.getFacetedUniqueValues()).map(
            ([value]) => ({
              label: value,
              value,
              icon: column.getFilterValue() === value ? CheckIcon : undefined,
            }),
          );

          return {
            id: column.id,
            title: column.id,
            options,
          };
        });

  console.log("filteredColumns", filteredColumns);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filteredColumns?.map((column) => (
          <DataTableFacetedFilter
            key={column.id}
            column={table.getColumn(column.id)}
            title={column.id}
            options={column.options}
          />
        ))}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
