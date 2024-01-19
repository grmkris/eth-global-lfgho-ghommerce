import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useApplicationModals } from "./useApplicationModals";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { trpcClient } from "@/features/trpc-client";

export const ApplicationModal = () => {
  const { close, isOpen, data } = useApplicationModals((state) => ({
    close: state.close,
    isOpen: state.isOpen,
    data: state.data,
  }));

  const stores = trpcClient.stores.getStores.useQuery({
    userId: data?.userId ?? "",
  });

  const storesIds = stores.data?.map((store) => {
    return store.id;
  });

  if (!storesIds) return <></>;

  const STORE_IDS = [...storesIds] as const;

  const DonationDataSchema = z.object({
    name: z.string(),
    description: z.string(),
    storeId: z.enum(STORE_IDS),
    options: z.array(
      z.object({
        amount: z.number(),
        description: z.string(),
      }),
    ),
  });
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader className={"mt-4 mx-4"}>
          <DialogTitle>Host your Twich donations</DialogTitle>
          <DialogDescription>
            Connect your store to one of the following applications to get
            started.
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          formSchema={DonationDataSchema}
          onSubmit={(data) => {
            console.log(data);
          }}
        >
          <AutoFormSubmit />
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
};
