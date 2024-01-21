import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useExecuteLifi, useLifiRoutes } from "@/lib/lifi/useLifi.tsx";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";
import { Address } from "ghommerce-schema/src/address.schema.ts";
import { Route } from "@lifi/sdk";
import { formatUnits } from "viem";

export const LifiScreen = (props: {
  swap: SwapSchema;
  onExecute?: (props: { route: Route }) => void;
}) => {
  const { data: routes } = useLifiRoutes(props);
  const executeLifi = useExecuteLifi({
    isTestnet: props.swap.isTestnet,
    onExecute: props.onExecute,
  });

  return (
    <div className="mt-4 space-y-4">
      {routes?.routes.slice(0, 1).map((route) => (
        <Card key={route.id} className="bg-gray-100 p-4 shadow-md rounded-lg">
          <CardTitle>Swap to pay invoice</CardTitle>
          <CardContent className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div>
                {route.fromAddress && (
                  <div className="flex flex-col space-y-1">
                    <strong>📍 From:</strong>
                    <CopyAddressLabel
                      address={Address.parse(route.fromAddress)}
                    />
                    <span className="text-xs">({route.fromToken.symbol})</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <span>🔄</span>
                {formatUnits(
                  BigInt(route.fromAmount),
                  route.fromToken.decimals,
                )}
              </div>
              <div>
                {route.toAddress && (
                  <div className="flex flex-col space-y-1">
                    <strong>🎯 To:</strong>
                    <CopyAddressLabel
                      address={Address.parse(route.toAddress)}
                    />
                    <span className="text-xs">({route.toToken.symbol})</span>
                  </div>
                )}
              </div>
            </div>
            {route.gasCostUSD && (
              <div className="text-sm">
                <strong>💰 Gas Cost (USD):</strong> {route.gasCostUSD}
              </div>
            )}
            <Button
              className="w-full mt-2 py-2 transition duration-300"
              disabled={executeLifi.isLoading}
              onClick={() => executeLifi.mutate({ route })}
            >
              Execute
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
