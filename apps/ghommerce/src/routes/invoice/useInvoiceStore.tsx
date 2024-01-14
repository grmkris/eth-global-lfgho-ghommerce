import { create } from "zustand";
import { RouterOutput } from "@/trpc-client.ts";
import { Address } from "wagmi";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { TokenAmountSchema } from "ghommerce-schema/src/tokens.schema.ts";

export type UserInvoiceInput = {
  paymentMethod: "card" | "crypto";
  email: string;
};

export type Invoice = RouterOutput["stores"]["getInvoice"];

export type InvoiceStore = {
  invoice: Invoice | null;
  userInvoiceInput: UserInvoiceInput | null;
  tokens: Record<
    Address,
    {
      item: TokenAmountSchema;
      amount: number;
    }
  >;
  setInvoice: (invoice: Invoice) => void;

  updateCryptoToken: (token: TokenAmountSchema, amount: number) => void;
  removeCryptoToken: (token: TokenAmountSchema) => void;
  setPaymentMethod: (method: "card" | "crypto") => void;
  setPaymentEmail: (email: string) => void;
};

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    immer((set) => ({
      invoice: null,
      userInvoiceInput: null,
      tokens: {},
      setInvoice: (invoice) =>
        set((draft) => {
          draft.invoice = invoice;
        }),
      updateCryptoToken: (token, amount) =>
        set((draft) => {
          draft.tokens[token.address as Address] = {
            item: token,
            amount,
          };
        }),
      removeCryptoToken: (token) =>
        set((draft) => {
          delete draft.tokens[token.address as Address];
        }),
      setPaymentMethod: (method) =>
        set((draft) => {
          if (draft.userInvoiceInput) {
            draft.userInvoiceInput.paymentMethod = method;
          } else {
            draft.userInvoiceInput = {
              paymentMethod: method,
              email: "",
            };
          }
        }),
      setPaymentEmail: (email) =>
        set((draft) => {
          if (draft.userInvoiceInput) {
            draft.userInvoiceInput.email = email;
          } else {
            draft.userInvoiceInput = {
              paymentMethod: "card",
              email,
            };
          }
        }),
    })),
    {
      name: "invoice",
    },
  ),
);
