import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import AutoForm from "@/components/auto-form";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { TokenInfo } from "@/components/web3/TokenElement.tsx";
import { CryptoScreen } from "@/routes/invoice/crypto.tsx";
import { Gatefi, useGateFi } from "@/routes/invoice/gatefi.tsx";
import { apiTrpc } from "@/trpc-client.ts";
import { Route, useNavigate } from "@tanstack/react-router";
import { PayerInformationSchema } from "ghommerce-schema/src/db/invoices.db.ts";
import { z } from "zod";
import { rootRoute } from "../Router.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { ChainId } from "ghommerce-schema/src/chains.schema.ts";
import { useState, useEffect } from "react";
import JSConfetti from "js-confetti";
import { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema.ts";
import { Receipt, GripHorizontal } from "lucide-react";

export const InvoiceSteps = z.enum(["payment", "crypto", "gatefi"]);
export type InvoiceSteps = z.infer<typeof InvoiceSteps>;
export const InvoiceParams = z.object({
  id: z.string(),
  selectedPaymentMethod: z
    .union([z.literal("card"), z.literal("crypto")])
    .optional(),
  step: InvoiceSteps.default("payment"),
  token: Address.optional(),
  chainId: ChainId.optional(),
});

export const invoiceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice",
  validateSearch: (search) => InvoiceParams.parse(search),
  component: Invoice,
});

function Invoice() {
  const invoiceId = invoiceRoute.useSearch().id;

  const invoice = apiTrpc.invoices.getInvoice.useQuery({
    invoiceId: invoiceId,
  });
  useEffect(() => {
    if (invoice.data?.status === "paid") {
      // Configure and start the confetti
      const jsConfetti = new JSConfetti();

      jsConfetti.addConfetti();
    }
  }, [invoice.data?.status]);
  if (invoice.isLoading || !invoice.data)
    return (
      <div className="bg-primary-900">
        <Skeleton className="w-full mt-5" />
      </div>
    );
  if (invoice.data.status === "pending")
    return (
      <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
        <PaymentScreen invoice={InvoiceSchema.parse(invoice.data)} />
      </div>
    );
  if (invoice.data.status === "paid")
    return (
      <div>
        <PaidScreen invoice={InvoiceSchema.parse(invoice.data)} />
      </div>
    );
  if (invoice.data.status === "handled")
    return (
      <div>
        <HandledScreen invoice={InvoiceSchema.parse(invoice.data)} />
      </div>
    );
}

function PaidScreen(props: { invoice: InvoiceSchema }) {
  return (
    <div className="flex flex-col space-y-2 max-h-screen custom-scrollbar">
      {/* Scrollable Content */}
      <div className="flex-grow overflow-auto space-y-2 custom-scrollbar">
        <div className="w-[450px] overflow-auto">
          <InvoiceInformation invoice={props.invoice} />
        </div>
        <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-bold">Thank you for your payment</div>
            <Receipt size={"40"} />
            <div className="text-sm font-medium">
              You will receive an email with your receipt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function HandledScreen(props: { invoice: InvoiceSchema }) {
  return (
    <div className="flex flex-col space-y-2 max-h-screen custom-scrollbar">
      {/* Scrollable Content */}
      <div className="flex-grow overflow-auto space-y-2 custom-scrollbar">
        <div className="w-[450px] overflow-auto">
          <InvoiceInformation invoice={props.invoice} />
        </div>
        <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-bold">
              Your payment is being handled
            </div>
            <GripHorizontal size={"40"} />
            <div className="text-sm font-medium">
              You will receive an email when status changes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function PaymentScreen(props: { invoice: InvoiceSchema }) {
  const { selectedPaymentMethod, step } = invoiceRoute.useSearch();
  const navigate = useNavigate({ from: invoiceRoute.fullPath });

  const gateFi = useGateFi({ invoiceId: props.invoice?.id });
  const toaster = useToast();
  const handleClick = () => {
    if (selectedPaymentMethod === "card") {
      gateFi.handleOnClick();
    }
    if (selectedPaymentMethod === "crypto") {
      // @ts-ignore https://discord.com/channels/719702312431386674/1007702008448426065/1198246465970110484
      navigate({ search: (prev) => ({ ...prev, step: "crypto" }) });
    } else {
      toaster.toast({
        title: "Select a payment method",
      });
    }
  };

  const isPayActionDisabled = selectedPaymentMethod === undefined;

  return (
    <div className="flex flex-col space-y-2 max-h-screen custom-scrollbar">
      {/* Scrollable Content */}
      <div className="flex-grow overflow-auto space-y-2 custom-scrollbar">
        <div className="w-[450px] overflow-auto">
          <InvoiceInformation invoice={props.invoice} />
        </div>
        {
          // STEP 1
          step === "payment" && (
            <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
              <PaymentSelector />

              <div className="mt-4">
                <Button
                  variant={isPayActionDisabled ? "outline" : "default"}
                  disabled={isPayActionDisabled}
                  className="w-full"
                  onClick={handleClick}
                >
                  Pay now
                </Button>{" "}
              </div>
            </div>
          )
        }

        {
          // STEP 2
          step === "crypto" && (
            <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
              <CryptoScreen invoice={props.invoice} />
            </div>
          )
        }
      </div>
    </div>
  );
}

export const PaymentSelector = () => {
  const params = invoiceRoute.useSearch();
  const navigate = useNavigate({ from: invoiceRoute.fullPath });
  const invoice = apiTrpc.invoices.getInvoice.useQuery({
    invoiceId: params.id,
  });

  const onSelectedChange = (value: string) => {
    console.log("onSelectedChange", value);
    navigate({ search: { id: params.id, selectedPaymentMethod: value } });
  };

  if (!invoice.data) return <>No invoice found</>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payer Information</CardTitle>
        <CardDescription>
          Select how you would like to pay for this invoice
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RadioGroup
          defaultValue={params.selectedPaymentMethod}
          className="grid grid-cols-2 gap-4"
          onValueChange={(value) => onSelectedChange(value)}
        >
          <div>
            <RadioGroupItem value="card" id="card" className="peer sr-only" />
            <Gatefi />
          </div>
          <div>
            <RadioGroupItem
              value="crypto"
              id="crypto"
              className="peer sr-only"
            />
            <Label
              htmlFor="crypto"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              Crypto
            </Label>
          </div>
        </RadioGroup>
        <InvoicePayerInformation
          invoiceId={invoice.data?.id}
          payerData={invoice.data?.payer}
        />
      </CardContent>
    </Card>
  );
};

function FullInvoiceInformation(props: { invoice: InvoiceSchema }) {
  const invoice = props.invoice;
  return (
    <div className="overflow-auto max-h-96 custom-scrollbar">
      {
        <CardContent className={`grid gap-6 ${SLIDE_IN_SLIDE_OUT_LEFT}`}>
          {/* Invoice Information */}
          <div className="grid grid-cols-2 gap-4">
            {invoice?.payer.payerName && (
              <div>
                <p className="font-medium text-gray-600">Payer:</p>
                <p>{invoice?.payer.payerName}</p>
              </div>
            )}
            {invoice?.payer.payerEmail && (
              <div>
                <p className="font-medium text-gray-600">Email:</p>
                <p>{invoice?.payer.payerEmail}</p>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-600">Amount Due:</p>
              <p>{`${invoice?.amountDue} ${invoice?.currency}`}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Due Date:</p>
              <p>
                {z.coerce.date().parse(invoice?.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-gray-600">Description:</p>
              <p>{invoice?.description}</p>
            </div>
            <div className="col-span-2">
              {invoice?.payer.payerWallet && (
                <div>
                  <p className="font-medium text-gray-600">Wallet Address:</p>
                  <p className="truncate">{invoice?.payer.payerWallet}</p>
                </div>
              )}
            </div>
            <div className="col-span-1">
              <p className="font-medium text-gray-600">Status:</p>
              <Badge>{invoice?.status}</Badge>
            </div>
            <div className="col-span-1">
              <p className="font-medium text-gray-600">Accepted tokens:</p>
              {invoice?.acceptedTokens.map((x) => (
                <TokenInfo key={x.address + x.chainId} tokenData={x} />
              ))}
            </div>
          </div>
        </CardContent>
      }
    </div>
  );
}

const MinimalInvoiceInfo = (props: { invoice: InvoiceSchema }) => {
  const invoice = props.invoice;
  return (
    <CardContent
      className={`flex flex-col items-center justify-between p-4 ${SLIDE_IN_SLIDE_OUT_LEFT} space-y-2`}
    >
      <div className="flex flex-col">
        <span className="text-lg">{`${invoice?.amountDue} ${invoice?.currency}`}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">Status:</span>
        <Badge>{invoice?.status}</Badge>
      </div>
    </CardContent>
  );
};

export const InvoiceInformation = (props: { invoice: InvoiceSchema }) => {
  const invoice = props.invoice;
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => setShowMore(!showMore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice?.store?.name}</CardTitle>
        <CardDescription>{invoice.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showMore ? (
          <FullInvoiceInformation invoice={invoice} />
        ) : (
          <MinimalInvoiceInfo invoice={invoice} />
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={toggleShowMore} variant={"outline"} size={"sm"}>
          {showMore ? "Show Less" : "Show More"}
        </Button>
      </CardFooter>
    </Card>
  );
};
export const InvoicePayerInformation = (props: {
  invoiceId: string;
  payerData: PayerInformationSchema;
}) => {
  const update = apiTrpc.invoices.updatePayerData.useMutation();
  return (
    <AutoForm
      formSchema={z.object({
        email: z.string().optional(),
      })}
      onSubmit={(data) => console.log(data)}
      values={{
        email:
          props.payerData?.payerEmail !== null
            ? props.payerData?.payerEmail
            : undefined,
      }}
      onParsedValuesChange={(data) =>
        update.mutate({
          invoiceId: props.invoiceId,
          payerData: {
            payerEmail: data.email,
          },
        })
      }
    />
  );
};
