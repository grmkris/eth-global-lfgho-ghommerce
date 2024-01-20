"use client";
import { CheckIcon } from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge.tsx";
import { ChainSchema } from "ghommerce-schema/src/chains.schema.ts";
import { Link } from "lucide-react";
import { VirtualizedCombobox } from "@/components/VirtualCombobox.tsx";
/**
 * Chain logo, name and id in a dropdown element
 * @param props
 * @constructor
 */
const ChainDropdownElement = (props: {
  chain: ChainSchema;
  selected: boolean;
}) => {
  return (
    <div className="flex items-center justify-between w-full space-x-2">
      <div className="flex items-center">
        {props.chain.logoURI ? (
          <img
            className="mr-2 invert"
            width={38}
            src={props.chain.logoURI ?? "/icons/eth-logo.svg"}
            alt={props.chain.displayName}
          />
        ) : (
          <Link className="mr-2" size={38} />
        )}
        <div>
          <div className="text-sm font-bold">
            {props.chain.displayName}{" "}
            {props.chain.isTestnet && (
              <Badge variant={"outline"}>Testnet</Badge>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {`${props.chain.name} ${props.chain.id}`}
          </span>
        </div>
      </div>
      {props.selected && <CheckIcon className="h-4 w-4" />}
    </div>
  );
};

export const MultiChainChainLabelElement = (props: {
  chain: ChainSchema;
}) => {
  return <Badge variant={"outline"}>{props.chain.displayName}</Badge>;
};

export const ChainDropdown = (props: {
  className?: string;
  onChange: (chains: ChainSchema[]) => void;
  multiple?: boolean;
  value?: ChainSchema[];
  options: ChainSchema[];
}) => {
  const onSelectedChange = (selected: ChainSchema[]) => {
    if (props.multiple) {
      props.onChange(selected);
      return;
    }
    const sliced = selected.slice(-1);
    props.onChange(sliced);
  };
  return (
    <VirtualizedCombobox
      multiple={props.multiple}
      multipleLabel={(chain) => <MultiChainChainLabelElement chain={chain} />}
      height={"400px"}
      elementHeight={50}
      options={props.options}
      selectedOptions={props.value ?? []}
      getOptionLabel={(option) => {
        return (
          <ChainDropdownElement
            chain={option}
            selected={
              props.value?.map((x) => x.name)?.includes(option.name) ?? false
            }
          />
        );
      }}
      getOptionValue={(option) => {
        return option.name;
      }}
      searchPlaceholder={"Search chain..."}
      onSelectOption={onSelectedChange}
    />
  );
};
