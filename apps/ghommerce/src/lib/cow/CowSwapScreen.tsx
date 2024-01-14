import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  useCowSwapCreateOrder,
  useCowSwapQuote,
} from "@/lib/cow/useCowSwap.tsx";
import { SwapSchema } from "schema/src/swap.schema.ts";

/**
 * Uncaught (in promise) TypeError: (0 , import_node_util.promisify) is not a function
 *     at ../../node_modules/node-fetch/src/body.js (@cowprotocol_cow-sdk.js?v=c8d53408:6376:47)
 *     at __init (chunk-HY2WJTHE.js?v=1bd11be2:16:56)
 *     at ../../node_modules/node-fetch/src/index.js (@cowprotocol_cow-sdk.js?v=c8d53408:7561:5)
 *     at __init (chunk-HY2WJTHE.js?v=1bd11be2:16:56)
 *     at ../../node_modules/@cowprotocol/contracts/lib/esm/api.js (@cowprotocol_cow-sdk.js?v=c8d53408:8288:5)
 *     at __init (chunk-HY2WJTHE.js?v=1bd11be2:16:56)
 *     at ../../node_modules/@cowprotocol/contracts/lib/esm/index.js (@cowprotocol_cow-sdk.js?v=c8d53408:9001:5)
 *     at __init (chunk-HY2WJTHE.js?v=1bd11be2:16:56)
 *     at ../../node_modules/@cowprotocol/cow-sdk/dist/index.js (@cowprotocol_cow-sdk.js?v=c8d53408:10414:14)
 *     at __require2 (chunk-HY2WJTHE.js?v=1bd11be2:19:50)
 * @param props
 * @constructor
 */
export const CowSwapScreen = (props: {
  swap: SwapSchema;
}) => {
  const { mutate: createOrder } = useCowSwapCreateOrder(props);
  const { data: marketPrice } = useCowSwapQuote(props);

  return (
    <div>
      <h1>CowSwap</h1>
      <Card>
        <CardContent>
          <ul>
            <li>
              <strong>From:</strong> {props.swap.fromToken.symbol} (
              {props.swap.fromToken.name})
            </li>
            <li>
              <strong>To:</strong> {props.swap.toToken.symbol} (
              {props.swap.toToken.name})
            </li>
            <li>
              <strong>Amount:</strong> {props.swap.fromAmount.toString()}{" "}
              {props.swap.fromToken.symbol}
            </li>
            <li>
              <strong>Receiver:</strong> {props.swap.toAddress}
            </li>
            <li>
              <strong>Market Price:</strong>{" "}
              {marketPrice?.quote?.sellAmount.toString() ?? "Loading..."}{" "}
              {props.swap.fromToken.symbol} / {props.swap.toToken.symbol}
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => createOrder()}>Create Order</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
