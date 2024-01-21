import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { RouterOutput, apiTrpc } from "@/trpc-client.ts";
import {Route, useNavigate} from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "../Router.tsx";
import {invoiceRoute} from "@/routes/invoice/invoice.tsx";

export const DonationParams = z.object({
  id: z.string(),
});

export const donationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/donation",
  validateSearch: (search) => DonationParams.parse(search),
  component: Donation,
});

function Donation() {
  const donationId = donationRoute.useSearch().id;

  const donation = apiTrpc.donations.getDonation.useQuery({
    donationId: donationId,
  });

  if (donation.isLoading || !donation.data)
    return (
      <div className="bg-primary-900">
        <Skeleton className="w-full mt-5" />
      </div>
    );

  return (
    <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
      <DonationInformation donation={donation.data} />
    </div>
  );
}

export const DonationInformation = (props: {
  donation: RouterOutput["donations"]["getDonation"];
}) => {
  const navigate = useNavigate({from: donationRoute.fullPath});
  const createInvoice = apiTrpc.donations.createDonationInvoice.useMutation({
    onSuccess: async (invoice) => {
      await navigate({
        to: invoiceRoute.fullPath,
        // @ts-ignore // TODO fix this https://discord.com/channels/719702312431386674/1198246465970110484
        search: (current) => {
          return {
            ...current,
            id: invoice.id,
          }
        }
      })
    },
  });
  const donation = props.donation;

  const handleDonationSelected = (amount: number) => {
    createInvoice.mutate({
      donationId: donation.id,
      amount: amount,
    });
  }

  return (
    <Card className="text-start">
      <CardHeader>
        <CardTitle>{donation?.store?.name}</CardTitle>
        <CardDescription>{donation?.store?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-start text-start p-4 gap-4">
        {donation.donationData.options.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-gray-400 text-sm text-start">
              Select the amount that you want to donate
            </p>

            <div className="flex flex-wrap flex-row gap-2 self-center pt-2">
              {donation.donationData.options.map((option) => {
                return (
                  <DonationOptionCard
                    donationOption={option}
                    onClick={() => handleDonationSelected(option.amount)}
                  />
                );
              })}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

const DonationOptionCard = (props: {
  donationOption: {
    description: string;
    amount: number;
  };
  onClick: () => void;
}) => {
  const { donationOption, onClick } = props;
  return (
    <Card
      className={"hover:shadow-lg cursor-pointer"}
      onClick={onClick}
    >
      <CardHeader>
        <CardDescription>{donationOption.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-start text-start p-4 gap-4">
        <div className="flex flex-col w-full justify-center items-center">
          <span className="text-3xl font-medium text-gray-600">
            {donationOption.amount}
          </span>
          <span className="text-gray-400 text-sm">USD</span>
        </div>
      </CardContent>
    </Card>
  );
};
