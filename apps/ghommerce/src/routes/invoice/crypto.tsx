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
  DrawerTitle, DrawerClose, DrawerHeader, DrawerDescription, DrawerFooter,
} from "@/components/ui/drawer.tsx";

import { Button } from "@/components/ui/button.tsx";
import {
  TokenAmountSchema,
  TokenSchema,
  ZERO_ADDRESS,
} from "ghommerce-schema/src/tokens.schema.ts";

import { TokenInfo } from "@/components/web3/TokenElement.tsx";
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
import { GhoCreditModal } from "@/lib/gho/GhoCreditComponent.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import {Loader} from "lucide-react";

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
            {selectedToken && <GhoCreditModal invoice={props.invoice} />}
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
            {/* Drawer for token selection */}
            {tokens.data?.items && <TokenSelectorDrawer account={account.address} isTestnet={props.invoice.isTestnet}
                                                        handleTokenChange={handleTokenChange} selectedToken={selectedToken} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export const TokenSelectorDrawer = (props: {
  account?: Address;
  isTestnet?: boolean;
  handleTokenChange: (token: TokenSchema) => void;
  selectedToken?: TokenSchema;
}) => {
  const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
      {
        quoteCurrency: "USD",
        address: props.account ?? ZERO_ADDRESS,
        isTestnet: props.isTestnet,
      },
      {
        enabled: !!props.account,
      },
  );
  const [isOpen, setIsOpen] = useState(false);
  return (
      <Drawer open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DrawerTrigger asChild onClick={()=> {
            setIsOpen(!isOpen);
        }}><Card>
          <CardContent>
            {props.selectedToken ? (
                <TokenInfo tokenData={props.selectedToken} />
            ) : (
                <Button className="self-center mt-6">Select a Token</Button>
            )}
          </CardContent>
        </Card></DrawerTrigger>
        <DrawerContent className='fixed inset-0 m-auto max-h-[90vh] max-w-xl flex items-center justify-center'>

          <DrawerHeader>
            <DrawerTitle>Your Tokens</DrawerTitle>
            <DrawerDescription>We found {tokens.data?.items.length} tokens in your wallet,
                select one to pay with, and we handle the rest.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className='overflow-auto p-4'>
          {tokens.data && (
              <TokenList
                  onSelect={(token) => {
                    props.handleTokenChange(token);
                    setIsOpen(false);
                  }}
                  tokens={TokenAmountSchema.array().parse(tokens.data?.items)}
                  selectedToken={props.selectedToken}
              />
          )}
            {
              !tokens.data && (
                  <div className='flex flex-col items-center justify-center space-y-4'>
                    <Loader className='w-8 h-8 animate-spin' />
                  </div>
              )
            }
            {
              tokens.data?.items.length === 0 && (
                  <div className='flex flex-col items-center justify-center space-y-4'>
                    <p className='text-sm text-gray-500'>No tokens found</p>
                  </div>
              )
            }
          </ScrollArea>
          <DrawerFooter>
            <DrawerClose className={"w-full"}>
              <Button variant="outline" className={"w-full"}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
}
