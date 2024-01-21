import { IntegrationCard, IntegrationCardProps } from "./IntegrationCard.tsx";
import {
  FaDiscord,
  FaWhatsapp,
  FaTwitch,
  FaWordpress,
  FaShopify,
} from "react-icons/fa";
import {
  ApplicationModals,
  useApplicationModals,
} from "./useApplicationModals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  ApplicationCard,
  ApplicationCardProps,
} from "@/routes/dashboard/components/applications/ApplicationCard.tsx";
import { Church, Contact, FileQuestion, Flame, Store } from "lucide-react";
import { trpcClient } from "@/features/trpc-client.ts";
import { selectDonationSchema } from "ghommerce-schema/src/db/donations.db.ts";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import { DataTable } from "@/components/table/components/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";

const integrationCards: IntegrationCardProps[] = [
  {
    name: "Twitch",
    webSite: "https://twitch.com",
    topics: ["streaming", "communication", "no code"],
    description:
      "Twitch is a platform designed for creating communities ranging from gamers to education and businesses.",
    icon: <FaTwitch size={32} />,
    modal: undefined,
  },
  {
    name: "Discord",
    webSite: "https://discord.com",
    topics: ["games", "communication"],
    description:
      "Discord is a platform designed for creating communities ranging from gamers to education and businesses.",
    icon: <FaDiscord size={32} />,
    modal: undefined,
  },
  {
    name: "WhatsApp",
    webSite: "https://www.whatsapp.com",
    topics: ["chat", "communication"],
    description:
      "WhatsApp is a free messaging app owned by Facebook that allows full end-to-end encryption for its service.",
    icon: <FaWhatsapp size={32} />,
    modal: undefined,
  },
  {
    name: "WordPress",
    webSite: "https://wordpress.com",
    topics: ["no code", "web"],
    description:
      "WordPress is a free and open-source content management system written in PHP and paired with a MySQL or MariaDB database.",
    icon: <FaWordpress size={32} />,
    modal: undefined,
  },
  {
    name: "Shopify",
    webSite: "https://shopify.com",
    topics: ["marketplace", "web"],
    description:
      "Shopify is an e-commerce platform for online stores and retail point-of-sale systems.",
    icon: <FaShopify size={32} />,
    modal: undefined,
  },
];

const applicationCards: ApplicationCardProps[] = [
  {
    type: "donations",
    name: "Donations",
    icon: <Church size={32} />,
    description: "Donations are a great way to monetize your content",
    enabled: true,
  },
  {
    type: "membership",
    name: "Membership",
    icon: <Flame size={32} />,
    description:
      "Patreon like membership are a great way to monetize your content",
  },
  {
    type: "polls",
    name: "Polls",
    icon: <FileQuestion size={32} />,
    description: "Create paid polls, to get feedback from most engaged users",
  },
  {
    type: "contact-form",
    name: "Contact Form",
    icon: <Contact size={32} />,
    description: "Get paid to answer questions from your community",
  },
  {
    type: "shop",
    name: "Shop",
    icon: <Store size={32} />,
    description: "Sell your products or services",
  },
];

export const ApplicationsTab = (props: { userId: string }) => {
  const donations = trpcClient.donations.getDonations.useQuery();
  console.log("donations", donations.data);
  return (
    <>
      <ApplicationModals />
      <div className="py-8 flex flex-col gap-4">
        <p className="text-gray-600">
          Create a new application or connect to an integration to start selling
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Create a new internal application to quickly start monetizing your
              content, products or services
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-4">
            {applicationCards.map((application) => (
              <ApplicationCard
                key={application.name}
                applicationItem={application}
                userId={props.userId}
              />
            ))}
          </CardContent>
        </Card>
        <DonationsTable
          data={selectDonationSchema.array().parse(donations.data ?? [])}
        />
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              You can connect 3rd party applications to your store to start
              selling in your favorite platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-4">
            {integrationCards.map((application) => (
              <IntegrationCard
                applicationItem={application}
                userId={props.userId}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const DonationsTable = (props: { data: selectDonationSchema[] }) => {
  const modal = useApplicationModals((state) => state.open);
  const columns = generateColumnsFromZodSchema(
    selectDonationSchema.pick({
      id: true,
      donationData: true,
      storeId: true,
    }),
    {
      donationData: {
        render: (value) => {
          return value.donationData ? (
            <span>{value.donationData.name}</span>
          ) : (
            <span>Unknown</span>
          );
        },
      },
    },
    {
      onOpen: (donation) => {
        console.log(donation);
        window.open(`http://localhost:5321/donation?id=${donation.id}`);
      },
    },
  );

  return (
    <>
      <DataTable
        data={props.data}
        columns={columns}
        rightToolbarActions={
          <Button onClick={() => modal("donations")}>Create Donation</Button>
        }
      />
    </>
  );
};
