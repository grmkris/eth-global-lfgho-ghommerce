import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  TokenAmountSchema,
  TokenSchema,
} from "ghommerce-schema/src/tokens.schema.ts";
import { ZERO_ADDRESS } from "ghommerce-schema/src/tokens.schema.ts";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";

export const TokenList = (props: {
  selectedToken?: TokenSchema;
  tokens: TokenAmountSchema[];
  onSelect?: (token: TokenAmountSchema) => void;
}) => {
  console.log("TokenList", props.selectedToken);
  const [selected, setSelected] = useState<TokenAmountSchema | undefined>(
    props.tokens.filter(
      (x) =>
        x.address === props.selectedToken?.address &&
        x.chain?.id === props.selectedToken?.chain?.id,
    )?.[0]
  );
  const handleSelect = (token: TokenAmountSchema) => {
    if (props.onSelect) props.onSelect(token);
    setSelected(token);
  };

  return (
    <div>
      {props.tokens.map((token) => {
        const isSelected =
          token.address === selected?.address &&
          token.chain?.id === selected?.chain?.id;
        return (
          <TokenCard
            tokenData={token}
            key={token.address + token.chain?.id}
            onSelect={handleSelect}
            isSelected={isSelected}
          />
        );
      })}
    </div>
  );
};

const selectedCardClassName = "border-2 border-blue-500";

function TokenCard(props: {
  tokenData: TokenAmountSchema;
  isSelected?: boolean;
  onSelect?: (token: TokenAmountSchema) => void;
}) {
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
      className={`${props.isSelected ? selectedCardClassName : ""} ${
        props.onSelect ? "cursor-pointer hover:bg-gray-100" : "" // Replace 'hover:bg-gray-100' with your desired hover style
      }`}
      onClick={() => {
        if (props.onSelect) props.onSelect(props.tokenData);
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
          </div>
        </div>
        <div className="flex justify-start space-x-1 mt-2">
          <Badge>
            {props.tokenData.address === ZERO_ADDRESS ? "Native" : "ERC20"}
          </Badge>
          <CopyAddressLabel address={props.tokenData.address} />
          <Badge>{props.tokenData.chain?.name}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
