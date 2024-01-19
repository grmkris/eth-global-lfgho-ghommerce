import { ApplicationCard, ApplicationCardProps } from "./ApplicationCard";
import {
  FaDiscord,
  FaWhatsapp,
  FaTwitch,
  FaWordpress,
  FaShopify,
} from "react-icons/fa";
import { ApplicationModals } from "./useApplicationModals";

const applicationsCards: ApplicationCardProps[] = [
  {
    name: "Twich Donations",
    webSite: "https://twich.com",
    topics: ["streaming", "communication", "no code"],
    description:
      "Twich is a platform designed for creating communities ranging from gamers to education and businesses.",
    icon: <FaTwitch size={32} />,
    modal: "applicationModal",
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

export const ApplicationsWrapper = (props: { userId: string }) => {
  return (
    <>
      <ApplicationModals />
      <div className="py-8 flex flex-col gap-4">
        <p className="text-gray-600">
          Connect your store to one of the following applications to get
          started.
        </p>
        <div className="flex flex-wrap gap-8 w-full">
          {applicationsCards.map((application) => (
            <ApplicationCard
              applicationItem={application}
              userId={props.userId}
            />
          ))}
        </div>
      </div>
    </>
  );
};
