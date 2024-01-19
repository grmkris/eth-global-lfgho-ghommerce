import { AvailableToken } from "ghommerce-schema/src/tokens.schema";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type FormStepsType =
  | "payer-information-form"
  | "invoice-information-form";

export const PayerInformation = z.object({
  payerName: z.string().optional(),
  payerEmail: z.string().email().optional(),
  payerWallet: z.string().optional(),
});

export type PayerInformation = z.infer<typeof PayerInformation>;

export const InvoiceInformation = z.object({
  description: z.string(),
  amountDue: z.coerce.number(),
  selectedToken: AvailableToken,
  dueDate: z.coerce.date(),
});

export type InvoiceInformation = z.infer<typeof InvoiceInformation>;

interface InvoiceFormState {
  currentStep: number;
  currentForm: FormStepsType;
  goToStep: (step: number) => void;
  payerInformation: PayerInformation;
  setPayerInformation: (payerInformation: PayerInformation) => void;
  invoiceData: InvoiceInformation;
  setInvoiceData: (invoiceData: InvoiceInformation) => void;
  resetState: () => void;
}

export const useInvoiceFormStore = create<InvoiceFormState>()(
  persist(
    immer((set) => ({
      currentStep: 0,
      currentForm: "payer-information-form",
      goToStep: (step) => set({ currentStep: step }),
      payerInformation: {},
      setPayerInformation: (payerInformation: PayerInformation) => {
        set({
          payerInformation,
        });
      },
      invoiceData: {
        description: "",
        amountDue: 0,
        selectedToken: "USDT",
        dueDate: new Date(),
      },
      setInvoiceData: (invoiceData: InvoiceInformation) => {
        set({
          invoiceData,
        });
      },
      resetState: () => {
        set({
          currentStep: 0,
          currentForm: "payer-information-form",
          payerInformation: {},
          invoiceData: {
            description: "",
            amountDue: 0,
            selectedToken: "USDT",
            dueDate: new Date(),
          },
        });
      },
    })),
    {
      name: "useInvoiceFormStore",
    }
  )
);
