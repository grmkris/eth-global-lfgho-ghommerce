import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useExecuteLifi, useLifiRoutes } from "@/lib/lifi/useLifi.tsx";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { Route } from "@lifi/sdk";

export const LifiScreen = (props: {
  swap: SwapSchema;
  onExecute?: (props: { route: Route }) => void;
}) => {
  const { data: routes } = useLifiRoutes(props);
  const { mutate: executeLifi } = useExecuteLifi({
    isTestnet: props.swap.isTestnet,
    onExecute: props.onExecute,
  });

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
                <strong>From:</strong> {route.fromAmount}{" "}
                {route.fromToken.symbol} ({route.fromToken.name})
                {`Chain:${route.fromChainId}`}
              </p>
              <p>
                <strong>To:</strong> {route.toAmount} {route.toToken.symbol} (
                {route.toToken.name}){`Chain:${route.toChainId}`}
              </p>
              {route.fromAddress && (
                <div>
                  <strong>From:</strong>{" "}
                  <CopyAddressLabel
                    address={Address.parse(route.fromAddress)}
                  />
                </div>
              )}
              {route.toAddress && (
                <div>
                  <strong>To Address:</strong>{" "}
                  <CopyAddressLabel address={Address.parse(route.toAddress)} />
                </div>
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
