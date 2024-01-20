import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import {
  Address,
  TransactionHash,
} from "ghommerce-schema/src/address.schema.ts";
import { LifiScreen } from "@/lib/lifi/LifiScreen.tsx";
import { Route } from "@lifi/sdk";
import { OnSwapProps } from "@/routes/invoice/crypto.tsx";

export const TokenSwapInformationCard = (props: {
  swapData: SwapSchema;
  onSwap?: (props: OnSwapProps) => void;
}) => {
  const onExecute = (data: { route: Route }) => {
    console.log("TokenSwapInformationCard 1", props);
    const lifiStep = data.route.steps.find((x) =>
      x.execution?.process.find((x) => x.type === "SWAP"),
    );
    console.log("TokenSwapInformationCard 2 ", lifiStep);
    const swap = lifiStep?.execution?.process.find((x) => x.type === "SWAP");
    console.log("TokenSwapInformationCard 3", swap);
    const txHash = swap?.txHash;
    if (txHash) {
      props.onSwap?.({
        txHash: TransactionHash.parse(txHash),
        toToken: Address.parse(lifiStep?.action.toToken),
        fromAmount: lifiStep?.action.fromAmount ?? "0",
        toAmount: lifiStep?.estimate.toAmount ?? "0",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-md">Tokens needed: {props.swapData.fromAmount}</h2>
      </div>
      <LifiScreen swap={props.swapData} onExecute={onExecute} />
    </div>
  );
};
