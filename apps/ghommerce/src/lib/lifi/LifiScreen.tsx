import { Card, CardContent } from "@/components/ui/card.tsx";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button.tsx";
import { useExecuteLifi, useLifiRoutes } from "@/lib/lifi/useLifi.tsx";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";

export const LifiScreen = (props: {
  swap: SwapSchema;
}) => {
  const { data: routes } = useLifiRoutes(props);
  const { mutate: executeLifi } = useExecuteLifi();

  return (
    <div>
      <h1>LiFi</h1>
      <ul>
        {routes?.routes.map((route) => (
          <Card key={route.id}>
            <CardContent>
              <h2>
                Route ID: {route.id.substring(0, 8)}...$
                {route.id.substring(56, 64)}
              </h2>
              <p>
                <strong>From:</strong>{" "}
                {formatUnits(
                  BigInt(route.fromAmount),
                  route.fromToken.decimals,
                )}
                {route.fromToken.symbol} ({route.fromToken.name})
              </p>
              <p>
                <strong>To:</strong>{" "}
                {formatUnits(BigInt(route.toAmount), route.toToken.decimals)}
                {route.toToken.symbol} ({route.toToken.name})
              </p>
              {route.fromAddress && (
                <p>
                  <strong>From Address:</strong> {route.fromAddress}
                </p>
              )}
              {route.toAddress && (
                <p>
                  <strong>To Address:</strong> {route.toAddress}
                </p>
              )}
              {route.gasCostUSD && (
                <p>
                  <strong>Gas Cost (USD):</strong> {route.gasCostUSD}
                </p>
              )}
              {/* Optionally, add more details about the steps here */}
              <Button onClick={() => executeLifi({ route })}>Execute</Button>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
};
