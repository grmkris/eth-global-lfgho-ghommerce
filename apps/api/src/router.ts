import { router } from "./lib/trpc";
import { verifyWalletRouter } from "./routes/verifyWalletRouter";
import { storeRouter } from "./routes/storeRouter";
import { ZeroExRouter } from "./routes/zeroExRouter";
import { tokenRouter } from "./routes/tokenRouter";
import { invoiceRouter } from "./routes/invoiceRouter";
import { donationRouter } from "./routes/donationRouter";

export const apiRouter = router({
  verifyWallet: verifyWalletRouter,
  zeroEx: ZeroExRouter,
  stores: storeRouter,
  invoices: invoiceRouter,
  donations: donationRouter,
  tokens: tokenRouter,
});

export type ApiRouter = typeof apiRouter;
