"use client";

import * as React from "react";
import { ChainSchema } from "schema/src/chains.schema.ts";
import { TokenSchema } from "schema/src/tokens.schema.ts";
import { VirtualizedCombobox } from "@/components/VirtualCombobox.tsx";
import { CheckIcon, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { ZERO_ADDRESS } from "@1inch/fusion-sdk";
import { apiTrpc } from "@/trpc-client.ts";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";

const TokenDropdownElement = (props: {
  token: TokenSchema;
  selected: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {props.token.logoURI ? (
          <img
            className="mr-2"
            width={38}
            src={props.token.logoURI ?? "/icons/eth-logo.svg"}
            alt={props.token.name}
          />
        ) : (
          <Link className="mr-2" size={38} />
        )}
        <div>
          <div className="text-sm font-bold">
            {props.token.name}{" "}
            {props.token.address === ZERO_ADDRESS && (
              <Badge variant={"outline"}>Native</Badge>
            )}
          </div>
          <CopyAddressLabel address={props.token.address} />
        </div>
      </div>
      {props.selected && <CheckIcon className="h-4 w-4" />}
    </div>
  );
};

export const TokenDropdown = (props: {
  className?: string;
  chain?: ChainSchema;
  onChange?: (token: TokenSchema[]) => void;
  multiple?: boolean;
  value?: TokenSchema[];
  options: TokenSchema[];
}) => {
  const tokens = apiTrpc.tokens.getTokens.useQuery({
    chain: props.chain?.name ?? "eth-mainnet",
  });
  const [selectedValues, setSelectedValues] = React.useState<TokenSchema[]>(
    props.value ?? [],
  );

  const handleTokenChange = (token: TokenSchema[]) => {
    if (!token) return;
    if (props.multiple) {
      if (props.onChange) props.onChange(token);
      setSelectedValues(token);
      return;
    }
    if (props.onChange) props.onChange(token.slice(-1));
    setSelectedValues(token.slice(-1));
  };

  return (
    <VirtualizedCombobox
      filter={(option, search) => {
        return (
          option.name.toLowerCase().includes(search.toLowerCase()) ||
          option.symbol.toLowerCase().includes(search.toLowerCase())
        );
      }}
      options={tokens.data ?? []}
      elementHeight={50}
      height={"400px"}
      getOptionLabel={(option) => {
        return (
          <TokenDropdownElement
            token={option}
            selected={selectedValues
              .map((x) => x.address)
              .includes(option.address)}
          />
        );
      }}
      getOptionValue={(option) => {
        return option.address;
      }}
      selectedOptions={selectedValues}
      searchPlaceholder={"Search token..."}
      onSelectOption={handleTokenChange}
    />
  );
};
