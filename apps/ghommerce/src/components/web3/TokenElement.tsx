import { BaseTokenSchema } from "ghommerce-schema/src/tokens.schema.ts";
import { apiTrpc } from "@/trpc-client.ts";
import { ChainIdToName } from "ghommerce-schema/src/chains.schema.ts";
import { ZERO_ADDRESS } from "ghommerce-schema/src/tokens.schema.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { ChainInfo } from "@/components/web3/ChainInfo.tsx";

export const TokenInfo = (props: { tokenData: BaseTokenSchema }) => {
  const token = apiTrpc.tokens.getTokenInfo.useQuery({
    tokenAddress: props.tokenData.address,
    chain: ChainIdToName[props.tokenData.chainId],
    quoteCurrency: "USD",
  });

  if (!token.data?.[0].contract_address)
    return (
      <div className="flex flex-row items-center space-x-2">
        <div className="flex flex-col">
          <div className="text-sm font-bold">
            {props.tokenData.address === ZERO_ADDRESS && (
              <Badge variant={"outline"}>Native</Badge>
            )}
          </div>
          <CopyAddressLabel address={props.tokenData.address} />
        </div>
      </div>
    );

  return (
    <div className="flex flex-row items-center space-x-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <img
          src={token.data?.[0].logo_url}
          className="w-10 h-10"
          alt={token.data?.[0].contract_name}
        />
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-bold">
          {token.data?.[0].contract_ticker_symbol}
          <ChainInfo chainId={props.tokenData.chainId} />
          {token.data?.[0].contract_address === ZERO_ADDRESS && (
            <Badge variant={"outline"}>Native</Badge>
          )}
        </div>
        <CopyAddressLabel
          address={Address.parse(token.data?.[0].contract_address)}
        />
      </div>
    </div>
  );
};
