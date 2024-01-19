import { apiTrpc, RouterOutput } from "@/trpc-client.ts"
import { ConnectKitButton } from "connectkit"
import { useAccount } from "wagmi"
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card.tsx"
import {
  TokenAmountSchema,
  TokenSchema,
} from "ghommerce-schema/src/tokens.schema.ts"
import { TokenList } from "@/components/web3/TokenList.tsx"
import { useNavigate } from "@tanstack/react-router"
import { invoiceRoute } from "@/routes/invoice/invoice.tsx"

export type Token =
  RouterOutput["tokens"]["getTokensForAddress"]["items"][0] & {
    amount?: number
  }

export const CryptoScreen = (props: {
  invoice: RouterOutput["invoices"]["getInvoice"]
}) => {
  const params = invoiceRoute.useSearch()
  const navigate = useNavigate({ from: invoiceRoute.fullPath })
  const updatePayerInformation = apiTrpc.invoices.updatePayerData.useMutation()
  const account = useAccount({
    onConnect: () => {
      if (account.address && account.address !== props.invoice.payerWallet)
        updatePayerInformation.mutate({
          invoiceId: props.invoice.id,
          payerData: { payerWallet: account.address },
        })
    },
  })
  const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
    {
      quoteCurrency: "USD",
      address: account.address,
    },
    {
      enabled: !!account.address,
    }
  )

  const handleTokenChange = async (token: TokenSchema, amount: string) => {
    console.log("handleTokenChange", token)
    if (!token) return
    const tokenData = tokens.data?.items.find(x => x.address === token.address)
    if (!tokenData) return
    navigate({
      search: {
        ...params,
        token: token.address,
        chainId: token.chainId,
        amount: amount,
      },
    })
  }

  return (
    <Card className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <CardHeader>
        <ConnectKitButton theme="retro" />
        <CardDescription>
          <h3 className="text-md">
            Invoice Total: ${props.invoice?.amountDue}
          </h3>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={"flex flex-col space-y-1"}>
          {
            // <TokenSwapInformationCard/>
          }
          {tokens.data && (
            <TokenList
              handleTokenChange={handleTokenChange}
              tokens={TokenAmountSchema.array().parse(tokens.data.items)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
