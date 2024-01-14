import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  useExecuteParaSwap,
  useParaSwapRoute,
} from "@/lib/paraswap/useParaswap.tsx";
import { SwapSchema } from "schema/src/swap.schema.ts";

export const ParaSwapScreen = (props: {
  swap: SwapSchema;
}) => {
  const paraSwapRoute = useParaSwapRoute(props);
  const executeParaSwap = useExecuteParaSwap(props);

  return (
    <div>
      <h1>ParaSwap</h1>
      <Card>
        <CardContent>
          <ul>
            <li>Amount received: {paraSwapRoute.data?.destAmount}</li>
            <li>srcAmount: {paraSwapRoute.data?.srcAmount}</li>
            <li>srcUSD: {paraSwapRoute.data?.srcUSD}</li>
            <li>destToken: {paraSwapRoute.data?.destToken}</li>
            <li>destDecimals: {paraSwapRoute.data?.destDecimals}</li>
            <li>destAmount: {paraSwapRoute.data?.destAmount}</li>
            <li>destUSD: {paraSwapRoute.data?.destUSD}</li>
            <li>gasCostUSD: {paraSwapRoute.data?.gasCostUSD}</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!paraSwapRoute.data?.bestRoute}
            onClick={() => {
              if (!paraSwapRoute.data?.bestRoute) throw new Error("No route");
              executeParaSwap.mutate({
                route: paraSwapRoute.data,
              });
            }}
          >
            Execute
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
