import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  ApplicationModalType,
  useApplicationModals,
} from "./useApplicationModals";

export type IntegrationTopic =
  | "streaming"
  | "communication"
  | "games"
  | "chat"
  | "no code"
  | "web"
  | "marketplace";

export type IntegrationCardProps = {
  name: string;
  webSite: string;
  topics: IntegrationTopic[];
  description: string;
  icon: ReactNode;
  modal: ApplicationModalType | undefined;
  enabled?: boolean;
};

export const IntegrationCard = (props: {
  applicationItem: IntegrationCardProps;
  userId: string;
}) => {
  const { applicationItem, userId } = props;
  const { open } = useApplicationModals((state) => ({
    open: state.open,
  }));

  return (
    <button
      type="button"
      disabled={!applicationItem.enabled}
      className={`flex flex-col rounded-2xl border-2 border-gray-300 p-8 gap-4 ${
        !applicationItem.enabled && "opacity-50"
      } hover:bg-gray-50 hover:cursor-pointer`}
      onClick={() => {
        applicationItem.modal &&
          open(applicationItem.modal, { userId: userId });
      }}
    >
      <div className="flex flex-row gap-4">
        {applicationItem.enabled ? (
          <div className="h-14 w-14 bg-gray-300 rounded-xl flex justify-center items-center">
            {applicationItem.icon}{" "}
          </div>
        ) : (
          <div className="h-14 w-14 bg-gray-300 rounded-xl flex justify-center items-center opacity-50">
            {applicationItem.icon}{" "}
          </div>
        )}
        <div className="flex flex-col gap-1 text-start">
          <h4 className="text-2xl font-semibold">{applicationItem.name}</h4>
          <a
            href={applicationItem.webSite}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-800 flex flex-row gap-1 items-center hover:underline"
          >
            {applicationItem.webSite}
            <FaExternalLinkAlt size={12} />
          </a>
        </div>
      </div>
      <p className="text-sm text-gray-600 text-start">
        {applicationItem.description}
      </p>
      <div className="flex flex-row gap-2">
        {applicationItem.topics.map((topic) => (
          <Badge className={mappingBagdeColors[topic]}>
            <p className="text-base">{topic}</p>
          </Badge>
        ))}
      </div>
    </button>
  );
};

const mappingBagdeColors: { [key in IntegrationTopic]: string } = {
  streaming: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
  communication: "bg-green-100 text-green-600 hover:bg-green-200",
  games: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
  chat: "bg-purple-100 text-purple-600 hover:bg-purple-200",
  "no code": "bg-amber-100 text-amber-600 hover:bg-amber-200",
  marketplace: "bg-orange-100 text-orange-600 hover:bg-orange-200",
  web: "bg-pink-100 text-pink-600 hover:bg-pink-200",
};
