import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import AutoForm from "@/components/auto-form";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { TokenInfo } from "@/components/web3/TokenElement.tsx";
import { TokenImage } from "@/components/web3/TokenImage.tsx";
import { CryptoScreen } from "@/routes/invoice/crypto.tsx";
import { Gatefi, useGateFi } from "@/routes/invoice/gatefi.tsx";
import { RouterOutput, apiTrpc } from "@/trpc-client.ts";
import { Route, useNavigate } from "@tanstack/react-router";
import { PayerInformationSchema } from "ghommerce-schema/src/db/invoices.ts";
import { z } from "zod";
import { rootRoute } from "../Router.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { ChainId } from "ghommerce-schema/src/chains.schema.ts";
import { useState, useEffect } from "react";
import JSConfetti from "js-confetti";

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
  amount: z.string().optional(),
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
    if (invoice.data?.status === "pending") {
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

  return (
    <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <PaymentScreen invoice={invoice.data} />
    </div>
  );
}

function PaymentScreen(props: {
  invoice: RouterOutput["invoices"]["getInvoice"];
}) {
  const { selectedPaymentMethod, step } = invoiceRoute.useSearch();
  const navigate = useNavigate({ from: invoiceRoute.fullPath });

  const gateFi = useGateFi({ invoiceId: props.invoice?.id });
  const toaster = useToast();
  const handleClick = () => {
    if (selectedPaymentMethod === "card") {
      gateFi.handleOnClick();
    }
    if (selectedPaymentMethod === "crypto") {
      navigate({ search: (prev) => ({ ...prev, step: "crypto" }) });
    } else {
      toaster.toast({
        title: "Select a payment method",
      });
    }
  };

    const isPayActionDisabled = selectedPaymentMethod === undefined;

  return (
    <div className="flex flex-col space-y-2 h-screen custom-scrollbar">
      {/* Sticky Header */}
      <Card className="sticky top-0 z-10 shadow-md">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Invoice ID: {props.invoice?.id}</CardDescription>
        </CardHeader>
      </Card>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-auto space-y-2 custom-scrollbar">
        <InvoiceInformation invoice={props.invoice} />
        {(step === "payment") && (
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
        )}

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
          defaultValue={undefined}
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
          payerData={invoice.data}
        />
      </CardContent>
    </Card>
  );
};

export const InvoiceInformation = (props: {
  invoice: RouterOutput["invoices"]["getInvoice"];
}) => {
  const invoice = props.invoice;
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => setShowMore(!showMore);

  const MinimalInvoiceInfo = () => (
    <CardContent className="flex flex-row items-center justify-between p-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">Payer:</span>
        <span className="text-lg">{invoice?.payerName}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">Due:</span>
        <span className="text-lg">{`${invoice?.amountDue} ${invoice?.currency}`}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">Status:</span>
        <Badge>{invoice?.status}</Badge>
      </div>
      <div className="flex items-center">
        {invoice?.acceptedTokens.map((x) => (
          <TokenImage tokenData={x} />
        ))}
      </div>
    </CardContent>
  );

  const FullInvoiceInfo = () => (
    <div className="overflow-auto max-h-96 custom-scrollbar">
      {
        <CardContent className="grid gap-6">
          {/* Invoice Information */}
          <div className="grid grid-cols-2 gap-4">
            {invoice?.payerName && (
              <div>
                <p className="font-medium text-gray-600">Payer:</p>
                <p>{invoice?.payerName}</p>
              </div>
            )}
            {invoice?.payerEmail && (
              <div>
                <p className="font-medium text-gray-600">Email:</p>
                <p>{invoice?.payerEmail}</p>
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
              {invoice?.payerWallet && (
                <div>
                  <p className="font-medium text-gray-600">Wallet Address:</p>
                  <p className="truncate">{invoice?.payerWallet}</p>
                </div>
              )}
            </div>
            <div className="col-span-1">
              <p className="font-medium text-gray-600">Status:</p>
              <Badge>{invoice?.status}</Badge>
            </div>
            <div className="col-span-1">
              <p className="font-medium text-gray-600">Accepted tokens:</p>
              <p>
                {invoice?.acceptedTokens.map((x) => (
                  <TokenInfo tokenData={x} />
                ))}
              </p>
            </div>
          </div>
        </CardContent>
      }
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice?.store?.name}</CardTitle>
        <Button onClick={toggleShowMore}>
          {showMore ? "Show Less" : "Show More"}
        </Button>
      </CardHeader>
      <CardContent>
        {showMore ? <FullInvoiceInfo /> : <MinimalInvoiceInfo />}
      </CardContent>
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
