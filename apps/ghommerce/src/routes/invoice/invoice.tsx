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
import { CryptoScreen } from "@/routes/invoice/crypto.tsx";
import { Gatefi, useGateFi } from "@/routes/invoice/gatefi.tsx";
import { RouterOutput, apiTrpc } from "@/trpc-client.ts";
import { Route, useNavigate } from "@tanstack/react-router";
import { PayerInformationSchema } from "ghommerce-schema/src/db/invoices.ts";
import { z } from "zod";
import { rootRoute } from "../Router.tsx";

export const InvoiceParams = z.object({
  id: z.string(),
  selectedPaymentMethod: z
    .union([z.literal("card"), z.literal("crypto")])
    .optional(),
  crypto: z.object({
    token: z.string(),
    amount: z.number(),
  }).optional(),
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
  const selectedPaymentMethod = invoiceRoute.useSearch().selectedPaymentMethod;
  const gateFi = useGateFi({ invoiceId: props.invoice?.id });
  const toaster = useToast();
  const handleClick = () => {
    if (selectedPaymentMethod === "card") {
      gateFi.handleOnClick();
      return;
    }
    toaster.toast({ title: "Please select a payment method" });
  };

  return (
    <div className="flex flex-col h-screen space-y-2">
      {/* Sticky Header */}
      <Card className="sticky top-0 z-10 bg-white shadow-md">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Invoice ID: {props.invoice?.id}</CardDescription>
        </CardHeader>
      </Card>

      {/* Scrollable Content */}
      <div className="overflow-auto flex-grow flex flex-col space-y-2 p-2">
        <InvoiceInformation invoice={props.invoice} />
        <PaymentSelector />
        {selectedPaymentMethod === "crypto" && (
          <CryptoScreen invoice={props.invoice} />
        )}
      </div>
      {/* Payment Button */}
      {/* Sticky Footer */}
      <Card className="sticky bottom-0 z-10 bg-white shadow-md">
        <Button variant="secondary" className={"w-full"} onClick={handleClick}>
          Pay now
        </Button>
      </Card>
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
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Add a new payment method to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RadioGroup
          defaultValue={params.selectedPaymentMethod ?? "card"}
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice?.store?.name}</CardTitle>
        <CardDescription>{invoice?.store?.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Invoice Information */}
        <div className="grid grid-cols-2 gap-4">
          {invoice?.payerName && (
            <div>
              <p className="font-medium text-gray-600">Payer Name:</p>
              <p>{invoice?.payerName}</p>
            </div>
          )}
          {invoice?.payerEmail && (
            <div>
              <p className="font-medium text-gray-600">Payer Email:</p>
              <p>{invoice?.payerEmail}</p>
            </div>
          )}
          {invoice?.payerWallet && (
            <div>
              <p className="font-medium text-gray-600">Wallet Address:</p>
              <p className="truncate">{invoice?.payerWallet}</p>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-600">Amount Due:</p>
            <p>{`${invoice?.amountDue} ${invoice?.currency}`}</p>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-gray-600">Description:</p>
            <p>{invoice?.description}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Due Date:</p>
            <p>
              {z.coerce.date().parse(invoice?.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Status:</p>
            <Badge>{invoice?.status}</Badge>
          </div>
          <div>
            <p className="font-medium text-gray-600">Accepted tokens:</p>
            <p>
              {invoice?.acceptedTokens.map((x) => (
                <TokenInfo tokenData={x} />
              ))}
            </p>
          </div>
        </div>
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
      formSchema={PayerInformationSchema}
      onSubmit={(data) => console.log(data)}
      values={props.payerData}
      onParsedValuesChange={(data) =>
        update.mutate({
          invoiceId: props.invoiceId,
          payerData: data,
        })
      }
    />
  );
};
