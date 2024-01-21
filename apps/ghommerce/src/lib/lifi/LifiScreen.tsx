import { Card, CardContent } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { useExecuteLifi, useLifiRoutes } from "@/lib/lifi/useLifi.tsx"
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts"
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx"
import { Address } from "ghommerce-schema/src/address.schema.ts"
import { Route } from "@lifi/sdk"

export const LifiScreen = (props: {
  swap: SwapSchema
  onExecute?: (props: { route: Route }) => void
}) => {
  const { data: routes } = useLifiRoutes(props)
  const { mutate: executeLifi } = useExecuteLifi({
    isTestnet: props.swap.isTestnet,
    onExecute: props.onExecute,
  })

  return (
    <div className="mt-4">
      {routes?.routes.map(route => (
        <Card key={route.id}>
          <CardContent>
            <h1>LiFi</h1>
            <h2>
              Route ID: {route.id.substring(0, 8)}...$
              {route.id.substring(56, 64)}
            </h2>
            {route.fromAddress && (
              <div>
                <strong>From:</strong>{" "}
                <CopyAddressLabel address={Address.parse(route.fromAddress)} />
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
            <Button className="m-4" onClick={() => executeLifi({ route })}>
              Execute
            </Button>
            <h2 className="text-md ">Tokens needed: {route.fromAmount}</h2>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
