import { z } from "zod";

import {
  eoas,
  insertEoaSchema,
  insertInvoiceSchema,
  insertPaymentSchema,
  insertSafeSchema,
  invoices,
  payments,
  safes,
  selectEoaSchema,
  selectInvoiceSchema,
  selectPaymentSchema,
  selectSafeSchema,
} from "ghommerce-schema/src/db/schema";
import { db } from "./db/db";
import { createRouterFactory } from "./lib/genericRouter";
import { router } from "./lib/trpc";
import { verifyWalletRouter } from "./routes/verifyWalletRouter";
import { storeRouter } from "./routes/storeRouter";
import { ZeroExRouter } from "./routes/zeroExRouter";
import { tokenRouter } from "./routes/tokenRouter";

export const apiRouter = router({
  invoices: createRouterFactory({
    id: "invoices",
    selectSchema: selectInvoiceSchema,
    updateSchema: selectInvoiceSchema.partial().extend({ id: z.string() }),
    insertSchema: insertInvoiceSchema.omit({ id: true }),
    hooks: {
      beforeInsert: (input, ctx) => {
        if (!ctx.session?.user?.id) throw new Error("Unauthorized");
        return {
          ...input,
          userId: ctx.session.user.id,
        };
      },
    },
    config: {
      store: {
        relation: "true",
      },
    },
    table: invoices,
    db: db,
  }),
  payments: createRouterFactory({
    id: "payments",
    selectSchema: selectPaymentSchema,
    updateSchema: selectPaymentSchema.partial().extend({ id: z.string() }),
    insertSchema: insertPaymentSchema,
    hooks: {
      beforeInsert: (input, ctx) => {
        if (!ctx.session?.user?.id) throw new Error("Unauthorized");
        return {
          ...input,
          userId: ctx.session.user.id,
        };
      },
    },
    table: payments,
    db: db,
  }),
  eoas: createRouterFactory({
    id: "eoas",
    selectSchema: selectEoaSchema,
    updateSchema: selectEoaSchema.partial().extend({ id: z.string() }),
    insertSchema: insertEoaSchema,
    hooks: {
      beforeInsert: (input, ctx) => {
        if (!ctx.session?.user?.id) throw new Error("Unauthorized");
        console.log("ctx.session.user.id", ctx.session.user.id);
        return {
          ...input,
          userId: ctx.session.user.id,
        };
      },
    },
    table: eoas,
    db: db,
  }),
  safes: createRouterFactory({
    id: "safes",
    selectSchema: selectSafeSchema,
    updateSchema: selectSafeSchema.partial().extend({ id: z.string() }),
    insertSchema: insertSafeSchema,
    config: {
      eoas: {
        relation: "true",
      },
    },
    hooks: {
      beforeInsert: (input, ctx) => {
        if (!ctx.session?.user?.id) throw new Error("Unauthorized");
        return {
          ...input,
          userId: ctx.session.user.id,
        };
      },
    },
    table: safes,
    db: db,
  }),
  verifyWallet: verifyWalletRouter,
  zeroEx: ZeroExRouter,
  stores: storeRouter,
  tokens: tokenRouter,
});

export type ApiRouter = typeof apiRouter;
