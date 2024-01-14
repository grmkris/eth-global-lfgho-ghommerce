import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { use1InchOrderQuote, useSwapOneInch } from "./use1Inch";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";

export const OneInchScreen = (props: {
  swap: SwapSchema;
}) => {
  const oneInchQuote = use1InchOrderQuote(props);
  const swapOneInch = useSwapOneInch(props);

  return (
    <div>
      <h1>1Inch</h1>
      <div>
        <Button onClick={() => swapOneInch.mutate({})}>Swap</Button>
      </div>
      <div>
        <Card>
          <CardContent>
            {oneInchQuote.data && (
              <div>
                <p>From Token Amount: {oneInchQuote.data.fromTokenAmount}</p>
                <p>To Token Amount: {oneInchQuote.data.toTokenAmount}</p>
                <p>Fee Token: {oneInchQuote.data.feeToken}</p>
                <p>Recommended Preset: {oneInchQuote.data.recommendedPreset}</p>
                <p>
                  Prices: USD From {oneInchQuote.data.prices.usd.fromToken}, To{" "}
                  {oneInchQuote.data.prices.usd.toToken}
                </p>
                <p>
                  Volume: USD From {oneInchQuote.data.volume.usd.fromToken}, To{" "}
                  {oneInchQuote.data.volume.usd.toToken}
                </p>
                <p>Settlement Address: {oneInchQuote.data.settlementAddress}</p>
                <p>Quote ID: {oneInchQuote.data.quoteId || "N/A"}</p>

                <h3>Presets:</h3>
                {Object.entries(oneInchQuote.data.presets).map(
                  ([key, preset]) => (
                    <div key={key}>
                      <p>Preset: {key}</p>
                      {/* Displaying preset details */}
                      {preset && (
                        <div>
                          <p>Auction Duration: {preset.auctionDuration}</p>
                          <p>Start Auction In: {preset.startAuctionIn}</p>
                          <p>Bank Fee: {preset.bankFee}</p>
                          <p>Initial Rate Bump: {preset.initialRateBump}</p>
                          <p>
                            Auction Start Amount: {preset.auctionStartAmount}
                          </p>
                          <p>Auction End Amount: {preset.auctionEndAmount}</p>
                          <p>Token Fee: {preset.tokenFee}</p>
                          {/* Map through Auction Points if available */}
                          {preset.points?.map((point, index) => (
                            <div key={point.delay + index}>
                              <p>Point Delay: {point.delay}</p>
                              <p>Point Coefficient: {point.coefficient}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
                <p>Whitelist: {oneInchQuote.data.whitelist.join(", ")}</p>
              </div>
            )}
            {!oneInchQuote.data && <p>No quote data available</p>}
          </CardContent>

          <CardFooter>
            <Button onClick={() => swapOneInch.mutate({})}>Swap</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
