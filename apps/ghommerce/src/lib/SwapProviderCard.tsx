import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {SwapOfferSchema} from "@/lib/useSwapProviders.tsx";

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
