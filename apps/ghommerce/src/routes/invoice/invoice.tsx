import { Route } from "@tanstack/react-router";
import { rootRoute } from "../Router.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useInvoiceStore } from "@/routes/invoice/useInvoiceStore.tsx";
import { Gatefi, useGateFi } from "@/routes/invoice/gatefi.tsx";
import { CryptoScreen } from "@/routes/invoice/crypto.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { apiTrpc, RouterOutput } from "@/trpc-client.ts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export const InvoiceParams = z.object({
  id: z.string(),
});

export const invoiceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice",
  validateSearch: (search) => InvoiceParams.parse(search),
  component: Index,
});

function Index() {
  const invoiceId = invoiceRoute.useSearch().id;
  const invoice = apiTrpc.stores.getInvoice.useQuery(
    { invoiceId: invoiceId },
    { enabled: !!invoiceId },
  );

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
  invoice: RouterOutput["stores"]["getInvoice"];
}) {
  const selection = useInvoiceStore((state) => ({
    userInvoiceInput: state.userInvoiceInput,
  }));
  const gateFi = useGateFi({ invoiceId: props.invoice?.id });
  const toaster = useToast();
  const handleClick = () => {
    console.log("handleClick", selection.userInvoiceInput);
    if (selection.userInvoiceInput?.paymentMethod === "card") {
      gateFi.handleOnClick();
      return;
    }
    toaster.toast({ title: "Please select a payment method" });
  };

  const selected = selection.userInvoiceInput?.paymentMethod;

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
        {selected === "crypto" && <CryptoScreen invoice={props.invoice} />}
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
  const selection = useInvoiceStore((state) => ({
    userInvoiceInput: state.userInvoiceInput,
    setPaymentMethod: state.setPaymentMethod,
    setPaymentEmail: state.setPaymentEmail,
  }));

  const selected = selection.userInvoiceInput?.paymentMethod;

  const onSelectedChange = (value: string) => {
    console.log("onSelectedChange", value);
    selection.setPaymentMethod(value as "card" | "crypto");
  };

  const onEmailChange = (value: string) => {
    console.log("onEmailChange", value);
    selection.setPaymentEmail(value);
  };

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
          defaultValue={selected}
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
        <div className="grid gap-2">
          <Label htmlFor="name">Email</Label>
          <Input
            id="name"
            placeholder="Your email"
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const InvoiceInformation = (props: {
  invoice: RouterOutput["stores"]["getInvoice"];
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
        </div>
      </CardContent>
    </Card>
  );
};
