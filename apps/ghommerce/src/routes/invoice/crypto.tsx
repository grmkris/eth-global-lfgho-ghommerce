import { apiTrpc } from "@/trpc-client.ts";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer.tsx";

import { Button } from "@/components/ui/button.tsx";
import {
  TokenAmountSchema,
  TokenSchema,
  ZERO_ADDRESS,
} from "ghommerce-schema/src/tokens.schema.ts";
import { TokenList } from "@/components/web3/TokenList.tsx";
import { useNavigate } from "@tanstack/react-router";
import { invoiceRoute } from "@/routes/invoice/invoice.tsx";
import {
  Address,
  TransactionHash,
} from "ghommerce-schema/src/address.schema.ts";
import type { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema";
import { TokenSwapInformationCard } from "@/components/web3/TokenSwapInformationCard";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type OnSwapProps = {
  txHash: TransactionHash;
  fromAmount: string;
  toAmount: string;
  toToken: Address;
};

export const CryptoScreen = (props: { invoice: InvoiceSchema }) => {
  const queryClient = useQueryClient();
  const params = invoiceRoute.useSearch();
  const navigate = useNavigate({ from: invoiceRoute.fullPath });
  const updatePayerInformation = apiTrpc.invoices.updatePayerData.useMutation();
  const recordPayment = apiTrpc.invoices.recordPayment.useMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const account = useAccount({
    onConnect: () => {
      if (
        account.address &&
        account.address !== props.invoice.payer.payerWallet
      )
        updatePayerInformation.mutate({
          invoiceId: props.invoice.id,
          payerData: { payerWallet: account.address },
        });
    },
  });
  const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
    {
      quoteCurrency: "USD",
      address: account.address ?? ZERO_ADDRESS,
      isTestnet: props.invoice.isTestnet,
    },
    {
      enabled: !!account.address,
    },
  );
  const selectedToken = tokens.data?.items.find(
    (x) => x.address === params.token,
  );

  const handleTokenChange = async (token: TokenSchema) => {
    if (!token) return;
    await navigate({
      search: {
        ...params,
        token: token.address,
        chainId: token.chainId,
      },
    });
  };

  const onSuccessfulSwap = async (data: OnSwapProps) => {
    const toToken = props.invoice.acceptedTokens.find(
      (x) => x.address.toString().toLowerCase() === data.toToken.toLowerCase(),
    );
    const fromToken = selectedToken;

    if (!fromToken || !toToken) {
      console.error("Invalid token", {
        fromToken,
        toToken,
        data,
        acceptedTokens: props.invoice.acceptedTokens,
      });
      return;
    }
    if (recordPayment.isLoading) return;
    recordPayment.mutateAsync({
      invoiceId: props.invoice.id,
      transactionHash: data.txHash,
      fromToken: TokenAmountSchema.parse({
        ...fromToken,
        amount: data.fromAmount,
      }),
      toToken: {
        ...toToken,
        amount: data.toAmount,
        updated_at: new Date(),
      },
    });
    await queryClient.invalidateQueries();
  };

  return (
    <div className="justify-center items-center text-center ">
      <Card className={SLIDE_IN_SLIDE_OUT_LEFT}>
        <CardHeader className="items-center">
          <CardTitle>
            <ConnectKitButton theme="retro" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={"flex flex-col space-y-1"}>
            {selectedToken &&
              account.address &&
              props.invoice.acceptedTokens.map((x) => {
                const PRICE_DECIMALS = 6; // Number of decimal places in priceUSD, adjust as needed
                const TOKEN_DECIMAL_FACTOR = BigInt(10) ** BigInt(18); // Adjust 18 to the max decimals you need to handle for tokens

                const invoiceAmountUSD = BigInt(
                  props.invoice.amountDue.toString(),
                );
                const tokenDecimals = BigInt(selectedToken.decimals);

                // Convert priceUSD to a BigInt-compatible integer by scaling up
                const scaledPriceUSD = BigInt(
                  Math.round(parseFloat("1") * 10 ** PRICE_DECIMALS),
                );

                // Scale up the amounts for precision
                const scaledInvoiceAmount =
                  invoiceAmountUSD * TOKEN_DECIMAL_FACTOR;
                const scaledTokenPrice = scaledPriceUSD * TOKEN_DECIMAL_FACTOR;

                // Calculate the amount of selectedToken needed to pay the invoice
                const fromAmountScaled =
                  (scaledInvoiceAmount * BigInt(10) ** tokenDecimals) /
                  scaledTokenPrice;

                const fromAmount =
                  fromAmountScaled * BigInt(10) ** BigInt(tokenDecimals);

                return (
                  <TokenSwapInformationCard
                    key={x.address + x.chainId}
                    onSwap={onSuccessfulSwap}
                    swapData={{
                      fromToken: selectedToken,
                      toToken: x,
                      fromAddress: Address.parse(account.address),
                      toAddress: Address.parse(props.invoice.store.wallet),
                      fromAmount: fromAmount.toString(),
                      isTestnet: props.invoice.isTestnet,
                    }}
                  />
                );
              })}
            {/* Trigger to open Drawer for token selection */}
            <Button onClick={handleDrawerOpen}>
              {selectedToken ? "Change Token" : "Select a Token"}
            </Button>

            {/* Drawer for token selection */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button onClick={handleDrawerClose}>Close</Button>
              </DrawerTrigger>
              <DrawerContent className="fixed inset-0 mx-auto my-auto w-80 z-50 bg-white shadow-lg transform h-3/4 top-1/4 custom-scrollbar  ${isScrollNeeded ? 'overflow-y-auto' : ''">
                <DrawerTitle className="m-2 mb-4 self-center">
                  Select a Token
                </DrawerTitle>
                {tokens.data && (
                  <TokenList
                    onSelect={handleTokenChange}
                    tokens={TokenAmountSchema.array().parse(tokens.data.items)}
                    selectedToken={selectedToken}
                  />
                )}
              </DrawerContent>
            </Drawer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
