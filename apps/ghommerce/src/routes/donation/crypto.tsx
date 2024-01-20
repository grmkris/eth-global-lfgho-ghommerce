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
import {
  TokenList,
  TokenSwapInformationCard,
} from "@/components/web3/TokenList.tsx"
import { useNavigate } from "@tanstack/react-router"
import { invoiceRoute } from "@/routes/invoice/invoice.tsx"
import { z } from "zod"
import { Address } from "ghommerce-schema/src/address.schema.ts"
import { donationRoute } from "./donation"

export type Token =
  RouterOutput["tokens"]["getTokensForAddress"]["items"][0] & {
    amount?: number
  }

export const CryptoScreen = (props: {
  donation: RouterOutput["donations"]["getDonation"]
}) => {
  const params = donationRoute.useSearch()
  const navigate = useNavigate({ from: donationRoute.fullPath })
  // const updatePayerInformation = apiTrpc.donations.updatePayerData.useMutation();
  // const account = useAccount({
  //   onConnect: () => {
  //     if (account.address && account.address !== props.invoice.payerWallet)
  //       updatePayerInformation.mutate({
  //         invoiceId: props.invoice.id,
  //         payerData: { payerWallet: account.address },
  //       });
  //   },
  // });
  // const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
  //   {
  //     quoteCurrency: "USD",
  //     address: account.address,
  //   },
  //   {
  //     enabled: !!account.address,
  //   },
  // );
  // const selectedToken = tokens.data?.items.find(
  //   (x) => x.address === params.token,
  // );

  const handleTokenChange = async (token: TokenSchema) => {
    if (!token) return
    navigate({
      search: {
        ...params,
        token: token.address,
        chainId: token.chainId,
      },
    })
  }

  return (
    <Card className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <p>This step works different than invoice</p>
    </Card>
  )
}