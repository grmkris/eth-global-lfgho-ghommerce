import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  if (!stores.data) return <></>;

  // const storesIds = stores.data?.map((store) => {
  //   return store.id;
  // });

  // if (!storesIds) return <></>;

  // const STORE_IDS = [...storesIds] as const;

  const DonationDataSchema = z.object({
    name: z.string(),
    description: z.string(),
    // storeId: z.enum(STORE_IDS),
    storeId: z.string(),
    options: z.array(
      z.object({
        amount: z.coerce.number(),
        description: z.string(),
      }),
    ),
  });
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-h-screen overflow-y-auto custom-scrollbar m-4">
        <DialogHeader className={"mt-4 mx-4"}>
          <DialogTitle>Host your Twich donations</DialogTitle>
          <DialogDescription>
            Connect your store to one of the following applications to get
            started.
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          formSchema={DonationDataSchema}
          fieldConfig={{
            // TODO: The current approach of add custom field doesnt send the information of the storeId selected to the form, because there is not "form" prop in render parent,
            // if you dont know how to call form.setValue inside renderParent, redo the commented part of the code, that will enable a selector of stores IDs, good enogh for now
            storeId: {
              renderParent: () => {
                return (
                  <div className="flex flex-col">
                    <label
                      htmlFor="storeId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Store
                    </label>
                    <select
                      id="storeId"
                      name="storeId"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      onSelect={() => {}}
                    >
                      {stores.data?.map((store) => {
                        return (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              },
            },
          }}
        >
          <AutoFormSubmit />
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
};
