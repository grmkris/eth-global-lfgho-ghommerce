import AutoForm from "@/components/auto-form";
import {
  FormStepsType,
  InvoiceInformation,
  PayerInformation,
  useInvoiceFormStore,
} from "./createInvoiceForm.store";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Contact2, ReceiptIcon } from "lucide-react";
import { ReactNode } from "react";

type StepFormType = {
  position: number;
  name: FormStepsType;
  title: string;
  description: string;
  formSchema: any;
  onSubmit: (data: any) => void;
  icon: ReactNode;
};

export const invoiceFormSteps: StepFormType[] = [
  {
    position: 0,
    name: "payer-information-form",
    title: "Payer information",
    description: "Introduce the payer information for the invoice",
    formSchema: PayerInformation,
    onSubmit: (data) => {
      console.log(data);
    },
    icon: <Contact2 />,
  },
  {
    position: 1,
    name: "invoice-information-form",
    title: "Invoice details",
    description: "Introduce the details of the invoice",
    formSchema: InvoiceInformation,
    onSubmit: (data) => {
      console.log(data);
    },
    icon: <ReceiptIcon />,
  },
];

export const CreateInvoiceForm = () => {
  const { currentStep, goToStep } = useInvoiceFormStore((state) => ({
    currentStep: state.currentStep,
    goToStep: state.goToStep,
  }));

  const selectedForm = invoiceFormSteps.find(
    (step) => currentStep === step.position
  );

  return (
    <DialogContent>
      <StepperHeader />
      <DialogHeader className={"mt-4 mx-4"}>
        <DialogTitle>{selectedForm?.title}</DialogTitle>
        <DialogDescription>{selectedForm?.description}</DialogDescription>
      </DialogHeader>
      <div>
        <AutoForm
          className={"m-4"}
          formSchema={selectedForm?.formSchema}
          onSubmit={(data) => {
            selectedForm?.onSubmit(data);
          }}
        >
          <FooterFormStepper />
          {/* <AutoFormSubmit /> */}
        </AutoForm>
      </div>
    </DialogContent>
  );
};

const FooterFormStepper = () => {
  const { currentStep, goToStep, currentForm } = useInvoiceFormStore(
    (state) => ({
      currentStep: state.currentStep,
      goToStep: state.goToStep,
      currentForm: state.currentForm,
    })
  );

  return (
    <div className="flex w-full flex-row justify-between">
      <Button
        disabled={currentStep === 0}
        onClick={() => goToStep(currentStep - 1)}
      >
        Back
      </Button>
      <Button
        onClick={() => {
          if (invoiceFormSteps.length - 1 === currentStep) return;
          if (
            currentStep ===
            invoiceFormSteps.find(
              (form) => form.name === "invoice-information-form"
            )?.position
          ) {
            console.log("on submit");
          }
          goToStep(currentStep + 1);
        }}
      >
        {currentStep ===
        invoiceFormSteps.find(
          (form) => form.name === "invoice-information-form"
        )?.position
          ? "Submit"
          : "Next"}
      </Button>
    </div>
  );
};

const StepperHeader = () => {
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
