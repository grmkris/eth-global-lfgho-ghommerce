import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpcClient } from "@/features/trpc-client";
import { useQueryClient } from "@tanstack/react-query";
import { ERC20_TOKEN_MAPPER } from "ghommerce-schema/src/tokens.schema.ts";
import { Contact2, ReceiptIcon } from "lucide-react";
import { ReactNode } from "react";
import {
  FormStepsType,
  InvoiceInformation,
  PayerInformation,
  useInvoiceFormStore,
} from "./createInvoiceForm.store";
import type { ZodObjectOrWrapped } from "@/components/auto-form/utils.ts";

type StepFormType = {
  position: number;
  name: FormStepsType;
  title: string;
  description: string;
  formSchema: ZodObjectOrWrapped;
  onSubmit:
    | ((data: PayerInformation) => void)
    | ((data: InvoiceInformation) => Promise<void>);
  icon: ReactNode;
};

export const CreateInvoiceForm = ({
  storeId,
  onClose,
}: {
  storeId: string;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const store = trpcClient.stores.getStore.useQuery({ storeId: storeId });
  const createInvoice = trpcClient.invoices.createInvoice.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating an invoice",
        description: `${error.message}`,
      });
    },
  });
  const {
    currentStep,
    setPayerInformation,
    setInvoiceData,
    goToStep,
    payerInformation,
    resetState,
  } = useInvoiceFormStore((state) => ({
    currentStep: state.currentStep,
    payerInformation: state.payerInformation,
    invoiceData: state.invoiceData,
    setPayerInformation: state.setPayerInformation,
    setInvoiceData: state.setInvoiceData,
    goToStep: state.goToStep,
    resetState: state.resetState,
  }));

  const invoiceFormSteps: StepFormType[] = [
    {
      position: 0,
      name: "payer-information-form",
      title: "Payer information",
      description: "Introduce the payer information for the invoice",
      formSchema: PayerInformation,
      onSubmit: (data: PayerInformation) => {
        setPayerInformation(data);
        if (invoiceFormSteps.length - 1 === currentStep) return;
        goToStep(currentStep + 1);
      },
      icon: <Contact2 />,
    },
    {
      position: 1,
      name: "invoice-information-form",
      title: "Invoice details",
      description: "Introduce the details of the invoice",
      formSchema: InvoiceInformation,
      onSubmit: async (data: InvoiceInformation) => {
        if (!store.data) throw new Error("Store not found");
        if (!data.selectedToken) throw new Error("Token not found");
        setInvoiceData(data);
        await createInvoice.mutateAsync({
          storeId: storeId,
          status: "pending",
          currency: "USD",
          ...payerInformation,
          ...data,
          acceptedTokens:
            ERC20_TOKEN_MAPPER[store.data?.isTestnet ? "testnet" : "mainnet"][
              data.selectedToken
            ],
        });
        resetState();
        onClose();
      },
      icon: <ReceiptIcon />,
    },
  ];

  const selectedForm = invoiceFormSteps.find(
    (step) => currentStep === step.position,
  );

  if (!selectedForm) return null;

  return (
    <DialogContent>
      <StepperHeader invoiceFormSteps={invoiceFormSteps} />
      <DialogHeader className={"mt-4 mx-4"}>
        <DialogTitle>{selectedForm?.title}</DialogTitle>
        <DialogDescription>{selectedForm?.description}</DialogDescription>
      </DialogHeader>
      <div>
        <AutoForm
          className={"m-4"}
          formSchema={selectedForm.formSchema}
          onSubmit={(data) => {
            // @ts-ignore // TODO good for  now
            selectedForm?.onSubmit(data);
          }}
        >
          <div className="flex w-full flex-row justify-between">
            <Button
              disabled={currentStep === 0}
              onClick={() => goToStep(currentStep - 1)}
            >
              Back
            </Button>
            <AutoFormSubmit
              className="w-fit"
              isLoading={createInvoice.isLoading}
            >
              {currentStep ===
              invoiceFormSteps.find(
                (form) => form.name === "invoice-information-form",
              )?.position
                ? "Submit"
                : "Next"}
            </AutoFormSubmit>
          </div>
        </AutoForm>
      </div>
    </DialogContent>
  );
};

const StepperHeader = ({
  invoiceFormSteps,
}: {
  invoiceFormSteps: StepFormType[];
}) => {
  const { currentStep, currentForm } = useInvoiceFormStore((state) => ({
    currentStep: state.currentStep,
    currentForm: state.currentForm,
  }));

  return (
    <ol className="max-w-lg mx-auto flex w-full">
      {invoiceFormSteps.map((step) => {
        return (
          <li
            className={`${
              currentStep === step.position || currentStep > step.position
                ? "text-blue-600"
                : "text-black"
            } ${
              currentForm !== step.name
                ? ""
                : "w-full after:inline-block after:h-1 after:w-full after:border-4 after:border-b after:border-blue-100 after:content-['']"
            } flex items-center `}
          >
            <span
              className={`${
                currentStep === step.position ? "bg-blue-100" : "bg-gray-100"
              } flex h-10 w-10 shrink-0 items-center justify-center rounded-full lg:h-12 lg:w-12`}
            >
              {step.icon}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
