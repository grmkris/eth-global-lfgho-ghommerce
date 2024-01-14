import { apiTrpc } from "@/trpc-client.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";

export const ZeroExScreen = (props: {
  order: SwapSchema;
}) => {
  const price = apiTrpc.zeroEx.getPrice.useQuery(props.order);

  return (
    <div>
      <h1>0x</h1>
      <Card>
        <CardContent>
          <ul>
            <li>Price: {price.data?.price}</li>
            <li>price: {price.data?.price}</li>
            <li>gasPrice: {price.data?.gasPrice}</li>
            <li>gas: {price.data?.gas}</li>
            <li>sellAmount: {price.data?.sellAmount}</li>
            <li>buyAmount: {price.data?.buyAmount}</li>
            <li>buyTokenAddress: {price.data?.buyTokenAddress}</li>
            <li>sellTokenAddress: {price.data?.sellTokenAddress}</li>
            <li>allowanceTarget: {price.data?.allowanceTarget}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
