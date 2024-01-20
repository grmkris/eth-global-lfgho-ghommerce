import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { LifiScreen } from "@/lib/lifi/LifiScreen.tsx";

export const TokenSwapInformationCard = (props: {
  swapData: SwapSchema;
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-md">Tokens needed: {props.swapData.fromAmount}</h2>
      </div>
      <LifiScreen swap={props.swapData} />
    </div>
  );
};
