import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { eoas } from "ghommerce-schema/src/db/schema.db";
import { generateNonce, SiweMessage } from "siwe";
import { z } from "zod";
import { db } from "../db/db";
import { authProcedure, router } from "../lib/trpc";
import { Address } from "ghommerce-schema/src/address.schema";

export const verifyWalletRouter = router({
  getNonce: authProcedure
    .input(
      z.object({
        wallet: Address,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input.wallet) throw new Error("Invalid wallet");
      console.log("wallet", ctx.session?.user?.id);
      // check if nonce exists
      const eoa = await db.query.eoas.findFirst({
        where: and(
          eq(eoas.wallet, input.wallet),
          eq(eoas.userId, ctx.session.user.id),
        ),
      });
      if (eoa) {
        console.log("nonce", eoa.nonce);
        return eoa.nonce;
      }

      // create nonce
      const nonce = generateNonce();
      const newEoa = await db
        .insert(eoas)
        .values({
          wallet: input.wallet,
          nonce,
          userId: ctx.session.user.id,
          createdAt: new Date(),
          verified: false,
          updatedAt: new Date(),
        })
        .returning()
        .execute();
      if (!newEoa[0].nonce) throw new Error("Invalid nonce");
      console.log("nonce", newEoa[0].nonce);
      return newEoa[0].nonce;
    }),

  verify: authProcedure
    .input(
      z.object({
        wallet: Address,
        message: z.string(),
        signature: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      const eoa = await db.query.eoas.findFirst({
        where: and(
          eq(eoas.wallet, input.wallet),
          eq(eoas.userId, ctx.session.user.id),
        ),
      });
      if (!eoa) throw new Error("Invalid nonce");
      try {
        const SIWEObject = new SiweMessage(input.message);
        const { data: message } = await SIWEObject.verify({
          signature: input.signature,
          nonce: eoa.nonce,
        });

        if (!eoa) throw new Error("Invalid nonce");
        const result = await db
          .update(eoas)
          .set({
            verified: true,
          })
          .where(eq(eoas.id, eoa.id))
          .returning()
          .execute();
        return result;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: JSON.stringify(e),
        });
      }
    }),
  isVerified: authProcedure
    .input(
      z.object({
        wallet: Address.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input.wallet) throw new Error("Invalid wallet");
      const eoa = await db.query.eoas.findFirst({
        where: and(
          eq(eoas.wallet, input.wallet),
          eq(eoas.userId, ctx.session.user.id),
        ),
      });
      if (!eoa) return false;
      return eoa.verified;
    }),
});
