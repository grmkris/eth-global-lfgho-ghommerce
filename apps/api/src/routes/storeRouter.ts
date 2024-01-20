import { authProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { and, eq } from "drizzle-orm";
import { eoas, safeEoas, safes } from "ghommerce-schema/src/db/safes";
import { stores } from "ghommerce-schema/src/db/stores";
import {
  insertInvoiceSchema,
  invoices,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices";

export const storeRouter = router({
  registerNewSafe: authProcedure
    .input(
      z.object({
        wallet: z.string().optional(),
        safeAddress: z.string(),
        isPredicted: z.boolean(),
        threshold: z.number(),
        nonce: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input.wallet) throw new Error("Invalid wallet");
      const safe = await db.query.safes.findFirst({
        where: and(
          eq(safes.address, input.safeAddress),
          eq(safes.userId, ctx.session.user.id),
        ),
      });
      const eoa = await db.query.eoas.findFirst({
        where: and(
          eq(eoas.wallet, input.wallet),
          eq(eoas.userId, ctx.session.user.id),
        ),
      });

      if (!eoa) throw new Error("Eoa not found");

      const newSafe = await db
        .insert(safes)
        .values({
          id: crypto.randomUUID(),
          nonce: input.nonce,
          predicted: input.isPredicted,
          threshold: input.threshold,
          userId: ctx.session.user.id,
          address: input.safeAddress,
          createdAt: new Date(),
        })
        .returning()
        .execute();

      const eoaSafe = await db
        .insert(safeEoas)
        .values({
          createdAt: new Date(),
          eoaId: eoa.id,
          id: crypto.randomUUID(),
          safeId: newSafe[0].id,
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      return newSafe[0];
    }),
  createNewStore: authProcedure
    .input(
      z.object({
        safeId: z.string().uuid(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      const store = await db.query.stores.findFirst({
        where: and(
          eq(stores.name, input.name),
          eq(stores.userId, ctx.session.user.id),
        ),
      });
      if (store) throw new Error("Store already exists");
      const newStore = await db
        .insert(stores)
        .values({
          id: crypto.randomUUID(),
          safeId: input.safeId,
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
          createdAt: new Date(),
        })
        .returning()
        .execute();
      return newStore[0];
    }),

  getStores: authProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        safeId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input?.safeId) {
        // return all stores for user
        const result = await db.query.stores.findMany({
          where: and(
            eq(stores.userId, ctx.session.user.id),
            eq(stores.userId, input.userId),
          ),
            with: {
              safe: {
                  with: {
                      eoas: {
                          with: {
                              eoa: true
                          }
                      }
                  }
              }
            }
        });
        return result;
      }
      const result = await db.query.stores.findMany({
        where: and(
          eq(stores.safeId, input.safeId),
          eq(stores.userId, ctx.session.user.id),
        ),
          with: {
              safe: {
                  with: {
                      eoas: {
                          with: {
                              eoa: true
                          }
                      }
                  }
              }
          }
      });
      return result;
    }),

  getSafes: authProcedure
    .input(
      z
        .object({
          wallet: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      const eoa = await db.query.eoas.findFirst({
        where: input?.wallet
          ? and(
              eq(eoas.wallet, input.wallet),
              eq(eoas.userId, ctx.session.user.id),
            )
          : eq(eoas.userId, ctx.session.user.id),
      });
      if (!eoa) throw new Error("Eoa not found");
      const safeEoa = await db.query.safeEoas.findFirst({
        where: eq(safeEoas.eoaId, eoa.id),
      });

      if (!safeEoa) throw new Error("SafeEoa not found");

      const result = await db.query.safes.findMany({
        where: and(
          eq(safes.id, safeEoa.safeId),
          eq(safes.userId, ctx.session.user.id),
        ),
      });
      return result;
    }),

  getStore: authProcedure
    .input(
      z.object({
        storeId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input?.storeId) throw new Error("Invalid storeId");
      const result = await db.query.stores.findFirst({
        where: and(
          eq(stores.id, input.storeId),
          eq(stores.userId, ctx.session.user.id),
        ),
      });
      return result;
    }),
  /**
   * Gets invoice by id along with store and safe
   */
});
