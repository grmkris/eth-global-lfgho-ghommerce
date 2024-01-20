import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { useApplicationModals } from "./useApplicationModals";

export type ApplicationType =
  | "donations"
  | "membership"
  | "polls"
  | "contact-form"
  | "shop";

export type ApplicationCardProps = {
  name: string;
  type: ApplicationType;
  description: string;
  icon: ReactNode;
  enabled?: boolean;
};

export const ApplicationCard = (props: {
  applicationItem: ApplicationCardProps;
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
        applicationItem.type && open(applicationItem.type, { userId: userId });
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
        </div>
      </div>
      <p className="text-sm text-gray-600 text-start">
        {applicationItem.description}
      </p>
      <div className="flex flex-row gap-2">
        <Badge className={ApplicationTypeToColor[props.applicationItem.type]}>
          <p className="text-base">{props.applicationItem.type}</p>
        </Badge>
      </div>
    </button>
  );
};

const ApplicationTypeToColor: { [key in ApplicationType]: string } = {
  shop: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
  "contact-form": "bg-green-100 text-green-600 hover:bg-green-200",
  polls: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
  membership: "bg-purple-100 text-purple-600 hover:bg-purple-200",
  donations: "bg-amber-100 text-amber-600 hover:bg-amber-200",
};
