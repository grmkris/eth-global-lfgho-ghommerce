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
import { ColumnDef, FilterFnOption } from "@tanstack/react-table";
import { z } from "zod";

/**
 * Utility type to extract keys from a zod schema
 */
type ExtractKeys<T> = T extends z.ZodObject<infer U> ? keyof U : never;

/**
 * FilterConfig object that can be applied to each key in the schema.
 */
export type FilterConfig<TData> = {
  id: string;
  filterFn?: FilterFnOption<TData>;
  title: string;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

/**
 * ColumnConfig object that can be applied to each key in the schema.
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ColumnConfig<TSchema extends z.ZodObject<any>> = {
  id?: string;
  name?: string;
  type?: string;
  relation?: string;
  enableSearch?: boolean;
  enableSorting?: boolean;
  filterConfig?: FilterConfig<z.infer<TSchema>> | true;
  render?: (row: z.infer<TSchema>) => React.ReactNode;
};

/**
 * Generic config type that can be applied to each key in the schema.
 * It is used for form customization.
 */
type FormFieldConfig = {
  name: string;
  label?: string;
};

/**
 * FormConfig object describing the form fields.
 */
// biome-ignore lint/suspicious/noExplicitAny: <🥸>
export type FormConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: FormFieldConfig;
};

// biome-ignore lint/suspicious/noExplicitAny: <🥸>
export type TableConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: ColumnConfig<TSchema>;
};

export function generateColumnsFromZodSchema<
  // biome-ignore lint/suspicious/noExplicitAny: <🥸>
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

    // @ts-expect-error TODO: fix this
    const itemName =
      config[name]?.name ?? item._def.description ?? beautifyObjectName(name);
    const key = [name].join(".");
    // @ts-expect-error TODO: fix this
    const columnConfig = config[name];

    return {
      accessorKey: key,
      header: (column) => (
        <DataTableColumnHeader column={column.column} title={itemName} />
      ),
      cell: (info) => {
        if (columnConfig?.render) {
          return columnConfig.render(info.row.original);
        }
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
            // @ts-ignore // biome-ignore lint/suspicious/noExplicitAny: <🥸>
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
