import { apiTrpc, RouterOutput } from "@/trpc-client.ts";
import { useAccount } from "wagmi";
import { useMemo, useState } from "react";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import * as R from "remeda";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card.tsx";
import { TokenAmountSchema, TokenSchema } from "schema/src/tokens.schema.ts";
import { TokenList } from "@/components/web3/TokenList.tsx";

export type Token =
  RouterOutput["tokens"]["getTokensForAddress"]["items"][0] & {
    amount?: number;
  };

export const CryptoScreen = (props: {
  invoice: RouterOutput["stores"]["getInvoice"];
}) => {
  const account = useAccount();
  const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
    {
      quoteCurrency: "USD",
      address: account.address,
    },
    {
      enabled: !!account.address,
    },
  );
  const [selectedTokens, setSelectedTokens] = useState<
    Record<string, TokenAmountSchema>
  >({});

  const totalValue = useMemo(() => {
    const tokensArray = Object.values(selectedTokens);
    return R.sumBy(
      tokensArray,
      (token) => (Number(token.amount) ?? 0) * (Number(token.priceUSD) ?? 0),
    ).toFixed(2);
  }, [selectedTokens]);

  const handleTokenChange = (token: TokenSchema, amount: number) => {
    if (!token) return;
    const tokenData = tokens.data?.items.find(
      (x) => x.address === token.address,
    );
    if (!tokenData) return;
    setSelectedTokens((prev) => ({
      ...prev,
      [token.address]: {
        ...TokenAmountSchema.parse(tokenData),
        amount: amount.toString(),
      },
    }));
  };

  if (!account.address)
    return (
      <Card className={SLIDE_IN_SLIDE_OUT_LEFT}>
        <CardHeader>
          <w3m-button />
        </CardHeader>
      </Card>
    );

  return (
    <Card className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <CardHeader>
        <w3m-button />
        <CardDescription>
          <h3 className="text-lg">
            Invoice Total: ${props.invoice?.amountDue}
          </h3>
          <h3 className="text-lg">Total selected: ${totalValue}</h3>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={"flex flex-col space-y-1"}>
          {tokens.data && (
            <TokenList
              handleTokenChange={handleTokenChange}
              tokens={TokenAmountSchema.array().parse(tokens.data.items)}
              invoice={props.invoice}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
