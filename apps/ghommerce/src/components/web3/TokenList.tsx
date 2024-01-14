import { z } from "zod";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Minus, Plus } from "lucide-react";
import { SwapProviderList, useSwapProviders } from "@/lib/useSwapProviders.tsx";
import {
  TokenAmountSchema,
  TokenSchema,
} from "ghommerce-schema/src/tokens.schema.ts";
import { ZERO_ADDRESS } from "@1inch/fusion-sdk";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";

export const TokenList = (props: {
  tokens: TokenAmountSchema[];
  swapData?: {
    toToken: TokenSchema;
    fromAddress: Address;
    toAddress: Address;
    toAmount: bigint;
  };
  handleTokenChange?: (token: TokenSchema, amount: number) => void;
  onSelect?: (token: TokenSchema) => void;
  selectedTokens?: TokenSchema[];
}) => {
  console.log("TokenList", {
    swapData: props.swapData,
    selectedTokens: props.selectedTokens,
  });
  return (
    <div>
      {props.tokens.map((token) => {
        let swapData: SwapSchema | undefined;
        if (props.swapData?.toToken && props.swapData?.toAmount) {
          // calculate fromAmount based on priceUSD of both tokens and toAmount
          //  props.swapData.toToken.priceUSD, token.priceUSD, props.swapData.toAmount
          console.log("props.swapData.toToken.priceUSD", {
            toTokenUsd: props.swapData.toToken.priceUSD,
            fromTokenUsd: token.priceUSD,
            toAmount: props.swapData.toAmount,
          });

          const totalUSDNeeded =
            Number(props.swapData.toToken.priceUSD ?? 0) *
            Number(props.swapData.toAmount.toString());
          const totalFromTokensNeeded =
            totalUSDNeeded / Number(token.priceUSD ?? 0);
          console.log(
            "TokenList- totalFromTokensNeeded",
            totalFromTokensNeeded,
          );
          const fromAmount = BigInt(
            (totalFromTokensNeeded * 10 ** token.decimals).toFixed(0),
          );
          console.log("TokenList- fromAmount", fromAmount);

          swapData = {
            fromToken: token,
            toToken: props.swapData.toToken,
            fromAmount: fromAmount.toString(),
            toAmount: props.swapData.toAmount.toString(),
            fromAddress: props.swapData.fromAddress,
            toAddress: props.swapData.toAddress,
          };
        }
        console.log("swapData", swapData);
        return (
          <TokenCard
            tokenData={token}
            swapData={swapData}
            key={token.address + token.chain?.id}
            onAmountChange={props.handleTokenChange}
            onSelect={props.onSelect}
            isSelected={
              !!props.selectedTokens?.find?.(
                (x) =>
                  x.address === token.address &&
                  x.chain?.name === token.chain?.name,
              )
            }
          />
        );
      })}
    </div>
  );
};

const selectedCardClassName = "border-2 border-blue-500";

function TokenCard(props: {
  tokenData: TokenAmountSchema;
  swapData?: SwapSchema;
  isSelected?: boolean;
  onAmountChange?: (token: TokenAmountSchema, amount: number) => void;
  onSelect?: (token: TokenAmountSchema) => void;
}) {
  const [amount, setAmount] = useState<string | undefined>();
  const [selected, setSelected] = useState(!!amount || props.isSelected);
  const isSelected = !!amount || props.isSelected || selected;

  const formattedBalance =
    props.tokenData.amount &&
    props.tokenData.decimals &&
    (Number(props.tokenData.amount) / 10 ** props.tokenData.decimals).toFixed(
      4,
    );
  const value =
    props.tokenData.priceUSD &&
    props.tokenData.decimals &&
    props.tokenData.amount &&
    (
      (Number(props.tokenData.priceUSD) * Number(props.tokenData.amount)) /
      10 ** props.tokenData.decimals
    ).toFixed(4);

  return (
    <Card
      className={`${isSelected ? selectedCardClassName : ""} ${
        props.onSelect ? "cursor-pointer hover:bg-gray-100" : "" // Replace 'hover:bg-gray-100' with your desired hover style
      }`}
      onClick={() => {
        props.onSelect
          ? props.onSelect(props.tokenData)
          : setSelected(!selected);
      }}
    >
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            {props.tokenData.logoURI && (
              <img
                src={props.tokenData.logoURI}
                alt={`${props.tokenData.symbol} Logo`}
                className="w-8 h-8"
              />
            )}
            <div>
              <span className="font-bold">{props.tokenData.symbol}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">Balance: {formattedBalance}</p>
            <p className="text-sm">
              Value: ${value} @ ${props.tokenData.priceUSD}
            </p>
            {typeof props?.onAmountChange === "function" && (
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="number"
                  className="h-10"
                  size={0}
                  value={amount}
                  onChange={(e) => {
                    if (e.target.value) {
                      const value = z.coerce.string().parse(e.target.value);
                      setAmount(value);
                      props.onAmountChange?.(
                        props.tokenData,
                        z.coerce.number().parse(value),
                      );
                    } else {
                      setAmount(undefined);
                      props.onAmountChange?.(props.tokenData, 0);
                    }
                  }}
                  placeholder="Enter USD amount"
                />
                <Button variant="outline" size="icon">
                  <Plus />
                </Button>
                <Button variant="outline" size="icon">
                  <Minus />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-start space-x-1 mt-2">
          <Badge>
            {props.tokenData.address === ZERO_ADDRESS ? "Native" : "ERC20"}
          </Badge>
          <CopyAddressLabel address={props.tokenData.address} />
          <Badge>{props.tokenData.chain?.name}</Badge>
        </div>
        {props.swapData && props.isSelected && (
          <TokenSwapInformationCard
            tokenData={props.tokenData}
            swapData={props.swapData}
          />
        )}
      </CardContent>
    </Card>
  );
}

export const TokenSwapInformationCard = (props: {
  swapData: SwapSchema;
  tokenData: TokenAmountSchema;
}) => {
  const { offers } = useSwapProviders({
    swap: props.swapData,
  });
  const totalAmount =
    Number(props.swapData.fromAmount) / 10 ** props.tokenData.decimals;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-md">Tokens needed: {totalAmount.toFixed(4)}</h2>
      </div>
      {offers ? (
        <SwapProviderList swapOffers={offers} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
