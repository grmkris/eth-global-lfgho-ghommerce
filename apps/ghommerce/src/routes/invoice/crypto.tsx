import { apiTrpc, RouterOutput } from "@/trpc-client.ts";
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
  TokenAmountSchema,
  TokenSchema,
} from "ghommerce-schema/src/tokens.schema.ts";
import {
  TokenList,
  TokenSwapInformationCard,
} from "@/components/web3/TokenList.tsx";
import { useNavigate } from "@tanstack/react-router";
import { invoiceRoute } from "@/routes/invoice/invoice.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import type { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema";
import { parseUnits } from "viem";

export type Token =
  RouterOutput["tokens"]["getTokensForAddress"]["items"][0] & {
    amount?: number;
  };

export const CryptoScreen = (props: { invoice: InvoiceSchema }) => {
  const params = invoiceRoute.useSearch();
  const navigate = useNavigate({ from: invoiceRoute.fullPath });
  const updatePayerInformation = apiTrpc.invoices.updatePayerData.useMutation();
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
      address: account.address,
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
    navigate({
      search: {
        ...params,
        token: token.address,
        chainId: token.chainId,
      },
    });
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
                const amount =
                  BigInt(
                    parseUnits(props.invoice.amountDue.toString(), x.decimals),
                  ) /
                  BigInt(parseUnits(x.priceUSD?.toString() ?? "1", x.decimals));
                return (
                  <TokenSwapInformationCard
                    swapData={{
                      fromToken: selectedToken,
                      toToken: x,
                      fromAddress: Address.parse(account.address),
                      toAddress: Address.parse(props.invoice.store.wallet),
                      fromAmount: amount.toString(),
                    }}
                  />
                );
              })}

            {tokens.data && (
              <TokenList
                onSelect={handleTokenChange}
                tokens={TokenAmountSchema.array().parse(tokens.data.items)}
                selectedToken={selectedToken}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
