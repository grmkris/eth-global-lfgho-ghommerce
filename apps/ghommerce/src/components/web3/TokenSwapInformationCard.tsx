import {SwapSchema} from "ghommerce-schema/src/swap.schema.ts";
import {SwapProviderList, useSwapProviders} from "@/lib/useSwapProviders.tsx";

export const TokenSwapInformationCard = (props: {
    swapData: SwapSchema;
}) => {
    console.log("TokenSwapInformationCard", props.swapData);
    const { offers } = useSwapProviders({
        swap: props.swapData,
    });
    return (
        <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
                <h2 className="text-md">Tokens needed: {props.swapData.fromAmount}</h2>
            </div>
            {offers ? (
                <SwapProviderList swapOffers={offers} />
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};
