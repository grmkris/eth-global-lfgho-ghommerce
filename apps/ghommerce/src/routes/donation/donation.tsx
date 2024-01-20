import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts"
import AutoForm from "@/components/auto-form"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Label } from "@/components/ui/label.tsx"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useToast } from "@/components/ui/use-toast.ts"
import { TokenInfo } from "@/components/web3/TokenElement.tsx"
import { TokenImage } from "@/components/web3/TokenImage.tsx"
import { RouterOutput, apiTrpc } from "@/trpc-client.ts"
import { Route, useNavigate } from "@tanstack/react-router"
import { PayerInformationSchema } from "ghommerce-schema/src/db/invoices.ts"
import { z } from "zod"
import { rootRoute } from "../Router.tsx"
import { Address } from "ghommerce-schema/src/address.schema.ts"
import { ChainId } from "ghommerce-schema/src/chains.schema.ts"
import { useState, useEffect } from "react"
import JSConfetti from "js-confetti"
import { Gatefi, useGateFi } from "./gatefi.tsx"
import { Input } from "@/components/ui/input.tsx"
import { CryptoScreen } from "./crypto.tsx"

export const DonationSteps = z.enum(["payment", "crypto", "gatefi"])
export type DonationSteps = z.infer<typeof DonationSteps>
export const DonationParams = z.object({
  id: z.string(),
  selectedPaymentMethod: z
    .union([z.literal("card"), z.literal("crypto")])
    .optional(),
  step: DonationSteps.default("payment"),
  token: Address.optional(),
  chainId: ChainId.optional(),
})

export const donationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/donation",
  validateSearch: search => DonationParams.parse(search),
  component: Donation,
})

function Donation() {
  const donationId = donationRoute.useSearch().id

  const donation = apiTrpc.donations.getDonation.useQuery({
    donationId: donationId,
  })

  if (donation.isLoading || !donation.data)
    return (
      <div className="bg-primary-900">
        <Skeleton className="w-full mt-5" />
      </div>
    )

  return (
    <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <PaymentScreen donation={donation.data} />
    </div>
  )
}

function PaymentScreen(props: {
  donation: RouterOutput["donations"]["getDonation"]
}) {
  const { selectedPaymentMethod, step } = donationRoute.useSearch()
  const navigate = useNavigate({ from: donationRoute.fullPath })

  const gateFi = useGateFi({ donationId: props.donation?.id })
  const toaster = useToast()
  const handleClick = () => {
    if (selectedPaymentMethod === "card") {
      gateFi.handleOnClick()
    }
    if (selectedPaymentMethod === "crypto") {
      navigate({ search: prev => ({ ...prev, step: "crypto" }) })
    } else {
      toaster.toast({
        title: "Select a payment method",
      })
    }
  }

  const isPayActionDisabled = selectedPaymentMethod === undefined

  return (
    <div className="flex flex-col space-y-2 h-screen custom-scrollbar">
      {/* Sticky Header */}
      <Card className="sticky top-0 z-10 shadow-md">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Donation ID: {props.donation?.id}</CardDescription>
        </CardHeader>
      </Card>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-auto space-y-2 custom-scrollbar">
        <DonationInformation donation={props.donation} />
        {step === "payment" && (
          <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
            <PaymentSelector />

            <div className="mt-4">
              <Button
                variant={isPayActionDisabled ? "outline" : "default"}
                disabled={isPayActionDisabled}
                className="w-full"
                onClick={handleClick}
              >
                Pay now
              </Button>{" "}
            </div>
          </div>
        )}

        {step === "crypto" && (
          <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
            <CryptoScreen donation={props.donation} />
          </div>
        )}
      </div>
    </div>
  )
}

export const PaymentSelector = () => {
  const params = donationRoute.useSearch()
  const navigate = useNavigate({ from: donationRoute.fullPath })
  const donation = apiTrpc.donations.getDonation.useQuery({
    donationId: params.id,
  })

  const onSelectedChange = (value: string) => {
    navigate({ search: { id: params.id, selectedPaymentMethod: value } })
  }

  if (!donation.data) return <>No donation found</>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payer Information</CardTitle>
        <CardDescription>
          Select how you would like to pay for this invoice
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RadioGroup
          defaultValue={undefined}
          className="grid grid-cols-2 gap-4"
          onValueChange={value => onSelectedChange(value)}
        >
          <div>
            <RadioGroupItem value="card" id="card" className="peer sr-only" />
            <Gatefi />
          </div>
          <div>
            <RadioGroupItem
              value="crypto"
              id="crypto"
              className="peer sr-only"
            />
            <Label
              htmlFor="crypto"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              Crypto
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

export const DonationInformation = (props: {
  donation: RouterOutput["donations"]["getDonation"]
}) => {
  const donation = props.donation

  const DonationInformationContent = () => {
    const [selectedDonationOption, setSelectedDonationOption] =
      useState<number>()

    return (
      <CardContent className="flex flex-col items-center justify-start text-start p-4 gap-4">
        <div className="flex flex-col text-start w-full">
          <span className="text-base font-medium text-gray-600">
            Description:
          </span>
          <span className="text-sm text-gray-400">
            {donation?.donationData.description}
          </span>
        </div>

        {donation.donationData.options.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <span className="text-base font-medium text-gray-600">
              Donation options:
            </span>
            <p className="text-gray-400 text-sm text-start">
              Select the amount that you want to donate
            </p>

            <div className="flex flex-wrap flex-row gap-2 self-center pt-2">
              {donation.donationData.options.map(option => {
                return (
                  <DonationOptionCard
                    donationOption={option}
                    isSelected={selectedDonationOption === option.amount}
                    onClick={() => setSelectedDonationOption(option.amount)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {donation.donationData.options.length === 0 && (
          <div className="flex flex-col gap-2 text-start w-full">
            <p className="text-gray-600 text-sm text-start">
              Introduce the amount to donate
            </p>
            <Input className="w-full" type="number" />
          </div>
        )}
      </CardContent>
    )
  }

  return (
    <Card className="text-start">
      <CardHeader>
        <CardTitle>{donation?.store?.name}</CardTitle>
      </CardHeader>
      <DonationInformationContent />
    </Card>
  )
}

const DonationOptionCard = ({
  donationOption,
  isSelected,
  onClick,
}: {
  donationOption: {
    description: string
    amount: number
  }
  isSelected: boolean
  onClick: () => void
}) => {
  return (
    <Card
      className={`text-start h-32 min-w-24 flex justify-center items-center hover:cursor-pointer ${
        isSelected ? "bg-gray-200" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-start text-start p-4 gap-4">
        <div className="flex flex-col w-full justify-center items-center">
          <span className="text-3xl font-medium text-gray-600">
            {donationOption.amount}
          </span>
          <span className="text-gray-400 text-sm">USD</span>
        </div>
      </CardContent>
    </Card>
  )
}

// export const InvoicePayerInformation = (props: {
//   invoiceId: string
//   payerData: PayerInformationSchema
// }) => {
//   const update = apiTrpc.invoices.updatePayerData.useMutation()
//   return (
//     <AutoForm
//       formSchema={z.object({
//         email: z.string().optional(),
//       })}
//       onSubmit={data => console.log(data)}
//       values={{
//         email:
//           props.payerData?.payerEmail !== null
//             ? props.payerData?.payerEmail
//             : undefined,
//       }}
//       onParsedValuesChange={data =>
//         update.mutate({
//           invoiceId: props.invoiceId,
//           payerData: {
//             payerEmail: data.email,
//           },
//         })
//       }
//     />
//   )
// }
