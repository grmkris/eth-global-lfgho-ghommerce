// import { use1InchOrderQuote } from "@/lib/1inch/use1Inch.tsx";
import { apiTrpc } from "@/trpc-client.ts";
import { useLifiRoutes } from "@/lib/lifi/useLifi.tsx";
import { useParaSwapRoute } from "@/lib/paraswap/useParaswap.tsx";
import { z } from "zod";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { TokenSchema } from "ghommerce-schema/src/tokens.schema.ts";

const SWAP_PROVIDERS = ["1inch", "0x", "lifi", "paraswap"] as const;
export const SwapProvider = z.enum(SWAP_PROVIDERS);
export type SwapProvider = z.infer<typeof SwapProvider>;

const SwapOfferSchema = z.object({
  provider: SwapProvider,
  gasPrice: z.string().optional(),
  gas: z.string().optional(),
  sellAmount: z.string(),
  buyAmount: z.string(),
  buyTokenAddress: TokenSchema,
  sellTokenAddress: TokenSchema,
  allowanceTarget: z.string().optional(),
});
export type SwapOfferSchema = z.infer<typeof SwapOfferSchema>;

export const useSwapProviders = (props: {
  swap: SwapSchema;
}) => {
  console.log("useSwapProviders", props);
  // const oneInchQuote = use1InchOrderQuote(props);
  const zeroExPrice = apiTrpc.zeroEx.getPrice.useQuery(props.swap);
  const lifiRoutes = useLifiRoutes(props);
  const paraswap = useParaSwapRoute(props);

  const swapOffers: SwapOfferSchema[] = [
    // {
    //   provider: "1inch",
    //   // gasPrice: oneInchQuote.data?.,
    //   // gas: oneInchQuote.data?.gas,
    //   sellAmount: oneInchQuote.data?.fromTokenAmount ?? "0",
    //   buyAmount: oneInchQuote.data?.toTokenAmount ?? "0",
    //   buyTokenAddress: props.swap.toToken,
    //   sellTokenAddress: props.swap.fromToken,
    //   // allowanceTarget: oneInchQuote.data?.allowanceTarget, TODO
    // },
    {
      provider: "0x",
      gasPrice: zeroExPrice.data?.gasPrice,
      gas: zeroExPrice.data?.gas,
      sellAmount: zeroExPrice.data?.sellAmount ?? "0",
      buyAmount: zeroExPrice.data?.buyAmount ?? "0",
      buyTokenAddress: props.swap.toToken,
      sellTokenAddress: props.swap.fromToken,
      allowanceTarget: zeroExPrice.data?.allowanceTarget,
    },
    {
      provider: "lifi",
      gasPrice: lifiRoutes.data?.routes[0]?.gasCostUSD,
      // gas: lifiRoutes.data?.routes[0].ga
      sellAmount: lifiRoutes.data?.routes[0]?.fromAmount.toString() ?? "0",
      buyAmount: lifiRoutes.data?.routes[0]?.toAmount.toString() ?? "0",
      buyTokenAddress: props.swap.toToken,
      sellTokenAddress: props.swap.fromToken,
    },
    {
      provider: "paraswap",
      gasPrice: paraswap.data?.gasCostUSD,
      gas: paraswap.data?.gasCost,
      sellAmount: paraswap.data?.srcAmount.toString() ?? "0",
      buyAmount: paraswap.data?.destAmount.toString() ?? "0",
      buyTokenAddress: props.swap.toToken,
      sellTokenAddress: props.swap.fromToken,
      // allowanceTarget: paraswap.data?. TODO
    },
  ];

  const parsed = SwapOfferSchema.array()
    .parse(swapOffers)
    .filter((x) => {
      return x.buyAmount !== "0" && x.sellAmount !== "0";
    });

  return {
    // oneInchQuote,
    zeroExPrice,
    lifiRoutes,
    paraswap,
    offers: parsed,
  };
};

export const SwapProviderCard = (props: {
  swapOffer: SwapOfferSchema;
}) => {
  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>
            <span className={"font-bold"}>Provider: </span>
          </CardTitle>
          <CardDescription>
            <span>{props.swapOffer.provider}</span>
          </CardDescription>
        </CardHeader>

        <div className={"flex flex-col space-x-1"}>
          {/*<span className={"font-bold"}>Sell Amount:</span>*/}
          {/*  <span>{formatUnits(BigInt(props.swapOffer.sellAmount), props.swapOffer.sellTokenAddress.decimals)}</span>*/}
          {/*</div>*/}
          {/*<div className={"flex flex-row space-x-1"}>*/}
          {/*  <span className={"font-bold"}>Buy Amount:</span>*/}
          {/*  <span>{formatUnits(BigInt(props.swapOffer.buyAmount), props.swapOffer.buyTokenAddress.decimals)}</span>*/}
          {/*</div>*/}
          <span className={"font-bold"}>Required tokens</span>
          <span>
            {props.swapOffer.sellAmount}{" "}
            {props.swapOffer.sellTokenAddress.symbol} ➡️{" "}
            {props.swapOffer.buyAmount}{" "}
            {props.swapOffer.sellTokenAddress.symbol}
          </span>
          <span>
            <span className={"font-bold"}>Gas Price:</span>
            <span>${props.swapOffer.gasPrice}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const SwapProviderList = (props: {
  swapOffers: SwapOfferSchema[];
}) => {
  if (props.swapOffers.length === 0) {
    return <div>No swap providers available</div>;
  }
  return (
    <div className={"flex flex-col space-y-1"}>
      {props.swapOffers.map((x) => (
        <SwapProviderCard swapOffer={x} />
      ))}
    </div>
  );
};
