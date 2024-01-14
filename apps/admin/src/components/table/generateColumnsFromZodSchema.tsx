import {
  beautifyObjectName,
  getBaseSchema,
  getBaseType,
} from "@/components/auto-form/utils.ts";
import { DataTableColumnHeader } from "@/components/table/components/data-table-column-header.tsx";
import {
  DataTableRowActions,
  DataTableRowActionsProps,
} from "@/components/table/components/data-table-row-actions.tsx";
import { TableConfig } from "@/features/auto-admin/createEntityRoute.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

export function generateColumnsFromZodSchema<
  TSchema extends z.ZodObject<any>,
  TData = z.infer<TSchema>,
>(
  zodSchema: TSchema,
  config: TableConfig<TSchema>,
  actions?: Omit<DataTableRowActionsProps<TData>, "row">,
): ColumnDef<TData>[] {
  // Function implementation
  const { shape } = getBaseSchema<TSchema>(zodSchema);

  const columns: ColumnDef<TData>[] = Object.keys(shape).map((name) => {
    const item = shape[name] as z.ZodAny;
    const zodBaseType = getBaseType(item);
    const itemName = item._def.description ?? beautifyObjectName(name);
    const key = [name].join(".");
    // @ts-expect-error TODO: fix this
    const columnConfig = config[name];

    return {
      accessorKey: key,
      header: (column) => (
        <DataTableColumnHeader column={column.column} title={itemName} />
      ),
      cell: (info) => {
        const cellValue = info.row.getValue(key);
        // Check if the value is a ZodDate
        if (zodBaseType === "ZodDate") {
          // @ts-expect-error TODO: fix this
          return new Date(cellValue).toLocaleDateString();
        }
        // Check if the value is a ZodObject
        if (zodBaseType === "ZodObject") {
          if (columnConfig?.relation) {
            // Assuming 'id' and 'name' are properties of your ZodObject
            const id = cellValue.id;
            // Render a clickable element
            return <a href={`/${columnConfig?.relation}s/${id}/edit`}>{id}</a>;
          }
          return JSON.stringify(cellValue);
        }
        if (zodBaseType === "ZodArray") {
          return JSON.stringify(cellValue);
        }
        return cellValue;
      },
      enableSorting: !!columnConfig?.enableSorting,
      enableColumnFilter: !!columnConfig?.filterConfig,
      filterFn: (row, id, value) => {
        if (columnConfig?.filterConfig === true)
          return value.includes(row.getValue(id));
        if (columnConfig?.filterConfig?.filterFn)
          return columnConfig?.filterConfig?.filterFn(row, id, value);
        return value.includes(row.getValue(id));
      },
    };
  });

  console.log("actions", actions);
  if (actions) {
    columns.push({
      accessorKey: "actions",
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onDelete={actions.onDelete}
          onEdit={actions.onEdit}
          onOpen={actions.onOpen}
          customActions={actions.customActions}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    });
  }

  return columns;
}
