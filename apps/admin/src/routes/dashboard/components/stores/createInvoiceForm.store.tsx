import { BaseTokenSchema } from "ghommerce-schema/src/tokens.schema";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type FormStepsType = "payer-information-form" | "invoice-information-form";

export const PayerInformation = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  wallet: z.string().optional(),
});

export type PayerInformation = z.infer<typeof PayerInformation>;

export const InvoiceInformation = z.object({
  description: z.string(),
  amountDue: z.number(),
  acceptedTokens: z.array(BaseTokenSchema),
  dueDate: z.coerce.date(),
});

export type InvoiceInformation = z.infer<typeof InvoiceInformation>;

interface InvoiceFormState {
  currentStep: number;
  currentForm: FormStepsType;
  goToStep: (step: number) => void;
  payerInformation: PayerInformation;
  invoiceData: InvoiceInformation;
}

export const useInvoiceFormStore = create<InvoiceFormState>()(
  persist(
    immer((set) => ({
      currentStep: 0,
      currentForm: "payer-information-form",
      goToStep: (step) =>
        set({ currentStep: step }),
      payerInformation: {},
      invoiceData: {
        description: "",
        amountDue: 0,
        acceptedTokens: [],
        dueDate: new Date(),
      },
    })),
    {
      name: "useInvoiceFormStore",
    }
  )
);
