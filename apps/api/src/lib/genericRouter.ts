import { AnyTable, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { ZodObject, z } from "zod";

import type { db } from "../db/db";
import { Context, publicProcedure, router } from "./trpc";
import { filterArray } from "ghommerce-schema/src/schema.utils";

/**
 * ColumnConfig object that can be applied to each key in the schema.
 */

// biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
type ColumnConfig<TSchema extends z.ZodObject<any>> = {
  relation?: string;
};

/**
 * Utility type to extract keys from a zod schema
 */
type ExtractKeys<T> = T extends z.ZodObject<infer U> ? keyof U : never;

/**
 * TableConfig object describing the table columns.
 */
// biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
export type RouterConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: ColumnConfig<TSchema>;
};

type RouterFactoryParams<
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TSelectSchema extends ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TInsertSchema extends ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TUpdateSchema extends ZodObject<any>,
> = {
  id: string;
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  table: AnyTable<any> & { id: any };
  selectSchema: TSelectSchema;
  updateSchema: TUpdateSchema;
  insertSchema: TInsertSchema;
  config?: RouterConfig<TSelectSchema>;
  hooks?: {
    beforeInsert?: (
      input: z.infer<TInsertSchema>,
      ctx: Context,
    ) => z.infer<TInsertSchema>;
    beforeUpdate?: (
      input: z.infer<TUpdateSchema>,
      ctx: Context,
    ) => z.infer<TUpdateSchema>;
    afterInsert?: (input: z.infer<TInsertSchema>, ctx: Context) => void;
    afterUpdate?: (input: z.infer<TUpdateSchema>, ctx: Context) => void;
  };
  db: db;
};

const operator = ["eq", "neq", "isNull", "isNotNull"] as const;
export const Operator = z.enum(operator);
export type Operator = z.infer<typeof Operator>;

export const Filter = z.object({
  column: z.string(),
  operator: Operator,
  value: z.union([z.string(), z.number()]).optional(),
});
export type Filter = z.infer<typeof Filter>;

export const ListParams = z.object({
  filters: Filter.array().optional(),
});
export type ListParams = z.infer<typeof ListParams>;
/**
 * Idea from https://dev.to/nicklucas/trpc-patterns-router-factories-and-polymorphism-30b0
 * @param params
 */
export function createRouterFactory<
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TSelectSchema extends z.ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TInsertSchema extends z.ZodObject<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <Needed due to usage of generics>
  TUpdateSchema extends z.ZodObject<any>,
>(params: RouterFactoryParams<TSelectSchema, TInsertSchema, TUpdateSchema>) {
  const { id, selectSchema, insertSchema, table, db, updateSchema } = params;
  // Create a zod schema for the filter based on the select schema

  return router({
    list: publicProcedure
      .input(ListParams.optional())
      .output(filterArray(selectSchema))
      .query(async ({ input }) => {
        const relatonExist = Object.keys(params.config ?? {}).find(
          (key) => params.config?.[key].relation,
        );

        // Check if input is not null or undefined
        console.log("input", input);
        let whereStatement;
        if (input?.filters) {
          console.log("input1", input);
          // If input is valid, process each entry
          for (const filter of input.filters) {
            if (whereStatement) {
              if (filter.operator === "eq") {
                whereStatement.append(
                  eq(params.table[filter.column], filter.value),
                );
              }
              if (filter.operator === "neq") {
                whereStatement.append(
                  ne(params.table[filter.column], filter.value),
                );
              }
              if (filter.operator === "isNull") {
                whereStatement.append(isNull(params.table[filter.column]));
              }
              if (filter.operator === "isNotNull") {
                whereStatement.append(isNotNull(params.table[filter.column]));
              }
            } else {
              if (filter.operator === "eq") {
                whereStatement = eq(params.table[filter.column], filter.value);
              }
              if (filter.operator === "neq") {
                whereStatement = eq(params.table[filter.column], filter.value);
              }
              if (filter.operator === "isNull") {
                whereStatement = isNull(params.table[filter.column]);
              }
              if (filter.operator === "isNotNull") {
                whereStatement = isNotNull(params.table[filter.column]);
              }
            }
          }
        }

        if (relatonExist) {
          const items = await db.query[id].findMany({
            with: {
              [relatonExist]: true,
            },
          });
          return selectSchema.array().parse(items);
        }
        const items = await db.query[id].findMany();

        return filterArray(selectSchema).parse(items);
      }),
    create: publicProcedure
      .input(insertSchema)
      .output(selectSchema)
      .mutation(async ({ input, ctx }) => {
        const newInput = params.hooks?.beforeInsert?.(input, ctx) ?? input;
        console.log("newInput", newInput);
        const item = await db
          .insert(table)
          .values({
            ...newInput,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
          .execute();
        params.hooks?.afterInsert?.(input, ctx);
        return selectSchema.parse(item[0]);
      }),
    get: publicProcedure
      .input(z.union([z.string(), z.number()]))
      .output(selectSchema)
      .query(async ({ input }) => {
        console.log("get: publicProcedure", input);

        // Determine if a relation exists in the configuration
        const relationExist = Object.keys(params.config ?? {}).find(
          (key) => params.config?.[key].relation,
        );

        let queryOptions: any = {
          where: eq(table.id, input),
        };

        // If a relation exists, include it in the query
        if (relationExist) {
          queryOptions.with = { [relationExist]: true };
        }

        const items = await db.query[id].findMany(queryOptions);
        return selectSchema.parse(items[0]);
      }),
    update: publicProcedure
      .input(updateSchema)
      .output(selectSchema)
      .mutation(async ({ input, ctx }) => {
        if (!input?.id) throw new Error("id is required");
        const newInput = params.hooks?.beforeUpdate?.(input, ctx) ?? input;
        const item = await db
          .update(table)
          .set({
            ...newInput,
            updatedAt: new Date(),
          })
          .where(eq(table.id, input.id))
          .returning()
          .execute();
        params.hooks?.afterUpdate?.(input, ctx);
        return selectSchema.parse(item[0]);
      }),
    delete: publicProcedure
      .input(z.string())
      .output(z.void())
      .mutation(async ({ input }) => {
        const result = await db
          .delete(table)
          .where(eq(table.id, input))
          .execute();
        console.log("result", result);
        return;
      }),
  });
}
