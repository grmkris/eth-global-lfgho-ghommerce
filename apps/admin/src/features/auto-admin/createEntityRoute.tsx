import {
  AddItemScreen,
  EditItemScreen,
} from "@/components/auto-cms/AddItemScreenProps.tsx";
import { getBaseSchema } from "@/components/auto-form/utils.ts";
import { DataTable } from "@/components/table/components/data-table.tsx";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { queryClient } from "@/features/TrpcProvider.tsx";
import { trpcClient } from "@/features/trpc-client.ts";
import {
  Link,
  Outlet,
  RootRoute,
  Route,
  useRouter,
} from "@tanstack/react-router";
import { FilterFnOption } from "@tanstack/react-table";
import { PlaneIcon, UserIcon } from "lucide-react";
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
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type FormConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: FormFieldConfig;
};

/**
 * TableConfig object describing the table columns.
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type TableConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: ColumnConfig<TSchema>;
};

/**
 * EntityRouteParams object describing a route for a specific database entity.
 */
type EntityRouteParams<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TSelectSchema extends z.ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TInsertSchema extends z.ZodObject<any>,
> = {
  id: string; // "users" | "messages" | "reminders" | "triggers" | "reactions";
  selectSchema: TSelectSchema;
  insertSchema: TInsertSchema;
  icon: typeof PlaneIcon | typeof UserIcon;
  tableConfig: TableConfig<TSelectSchema>;
  formConfig?: FormConfig<TInsertSchema>;
};

/**
 * Utility function to create an EntityRouteParams object.
 * @param params
 */
export function createEntityRoute<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TSelectSchema extends z.ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TInsertSchema extends z.ZodObject<any>,
>(
  params: EntityRouteParams<TSelectSchema, TInsertSchema>,
): EntityRouteParams<TSelectSchema, TInsertSchema> {
  return params;
}

/**
 * Function to generate a router for a specific database entity.
 * @param parentRoute
 * @param params
 */
export function generateEntityRouter<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TSelectSchema extends z.ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  TInsertSchema extends z.ZodObject<any>,
>(
  parentRoute: Route | RootRoute,
  params: EntityRouteParams<TSelectSchema, TInsertSchema>,
) {
  const entityRoute = params;
  const entityRouter = new Route({
    getParentRoute: () => parentRoute,
    path: entityRoute.id,
    component: () => {
      return <Outlet />;
    },
  });

  /**
   * entity index route
   */
  const entityIndexRoute = new Route({
    getParentRoute: () => entityRouter,
    path: "/",
    component: () => {
      const router = useRouter();
      // @ts-expect-error TODO i don't know how to fix this
      const itemsQuery = trpcClient[`${entityRoute.id}`].list.useQuery();
      const deleteMutation =
        trpcClient[`${entityRoute.id}`].delete.useMutation();
      const columns = generateColumnsFromZodSchema(
        entityRoute.selectSchema,
        entityRoute.tableConfig,
        {
          onDelete: async (id) => {
            console.log("delete");
            // @ts-ignore
            await deleteMutation.mutateAsync(id);
            await queryClient.invalidateQueries();
          },
          onEdit: async (input) => {
            console.log("edit");
            await router.navigate({
              to: `/${entityRoute.id}/${input.id}/edit`,
            });
          },
        },
      );
      console.log("columns", {
        columns,
        selectSchema: entityRoute.selectSchema,
      });
      if (itemsQuery.isLoading) {
        return (
          // You might want to abstract Skeleton into a separate component for reusability
          <Skeleton
            className="w-full"
            style={{
              height: "500px",
            }}
          />
        );
      }
      return (
        <>
          <Button className="mb-4">
            <Link to={`/${entityRoute.id}/create`}>Add {entityRoute.id}</Link>
          </Button>
          <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <DataTable
              data={itemsQuery.data ?? []}
              columns={columns}
              filterableCols={Object.keys(entityRoute.tableConfig)
                .filter((x) => {
                  // @ts-expect-error TODO i don't know how to fix this
                  const columnConfig = entityRoute.tableConfig[x];
                  return !!columnConfig.filterConfig;
                })
                .map((key) => {
                  // @ts-expect-error TODO i don't know how to fix this
                  const columnConfig = entityRoute.tableConfig[key];
                  // if options are not defined and column schema is zod enum, generate options from enum
                  const schema = getBaseSchema(
                    entityRoute.selectSchema.shape[key],
                  );
                  if (
                    columnConfig?.filterConfig &&
                    !columnConfig?.filterConfig?.options &&
                    schema._def.typeName === "ZodEnum"
                  ) {
                    console.log("detected zod enum schema", schema);
                    const baseValues = (
                      getBaseSchema(
                        entityRoute.selectSchema.shape[key],
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                      ) as unknown as z.ZodEnum<any>
                    )._def.values;

                    let values: [string, string][] = [];
                    if (!Array.isArray(baseValues)) {
                      values = Object.entries(baseValues);
                    } else {
                      values = baseValues.map((value) => [value, value]);
                    }

                    columnConfig.filterConfig = {
                      ...columnConfig.filterConfig,
                      options: values.map((value) => ({
                        label: value[1],
                        value: value[0],
                      })),
                    };
                  }
                  return {
                    id: key,
                    title: columnConfig.name,
                    options: columnConfig.filterConfig?.options,
                  };
                })}
            />
          </div>
        </>
      );
    },
  });

  /**
   * Add entity route
   */
  const entityAddRoute = new Route({
    getParentRoute: () => entityRouter,
    path: "/create",
    component: () => {
      return (
        <AddItemScreen
          itemSchema={entityRoute.insertSchema}
          entityName={entityRoute.id}
          onAdd={() => {
            console.log("added");
          }}
        />
      );
    },
  });

  /**
   * Edit entity route
   */
  const entityEditRoute = new Route({
    getParentRoute: () => entityRouter,
    path: "$id/edit",
    component: () => {
      const { id } = entityEditRoute.useParams();
      // @ts-expect-error TODO i don't know how to fix this
      const user = trpcClient[`${entityRoute.id}`].get.useQuery(id);
      if (user.isLoading || !user.data) return <div>Loading...</div>;
      return (
        <EditItemScreen
          entityId={id}
          entityData={user.data}
          itemSchema={entityRoute.insertSchema}
          entityName={entityRoute.id}
        />
      );
    },
  });

  return entityRouter.addChildren([
    entityIndexRoute,
    entityAddRoute,
    entityEditRoute,
  ]);
}
