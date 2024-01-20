import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApplicationModals } from "./useApplicationModals";
import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { trpcClient } from "@/features/trpc-client";
import { DonationDataSchema } from "ghommerce-schema/src/db/donations.db.ts";
import { VirtualizedCombobox } from "@/components/VirtualCombobox.tsx";
import { useState } from "react";
import {useToast} from "@/components/ui/use-toast.ts";

const CreateDonationForm = DonationDataSchema;

export const CreateDonationModal = () => {
  const { close, isOpen } = useApplicationModals((state) => ({
    close: state.close,
    isOpen: state.isOpen,
  }));
  const [selectedStore, setSelectedStore] = useState<string | undefined>();
  const toaster = useToast();
  const createDonation = trpcClient.donations.createDonation.useMutation({
      onSuccess: () => {
          toaster.toast({
              title: "Donation created",
              description: "Your donation has been created successfully",
              variant: 'success'
          })
          close()
      }
  })
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
        <StoresDropdown
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
        />
        <AutoForm
          onSubmit={(data) => {
            console.log("onSubmit123", data);
              createDonation.mutate({
                  storeId: selectedStore,
                  donationData: data
              })
          }}
          formSchema={CreateDonationForm}
        >
          <AutoFormSubmit />
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
};

export const StoresDropdown = (props: {
  selectedStore?: string;
  setSelectedStore: (store: string) => void;
}) => {
  const stores = trpcClient.stores.getStores.useQuery({});
  const [value, setValue] = useState<string | undefined>();

  return (
    <VirtualizedCombobox
      options={
        stores.data?.map((store) => ({
          value: store.id,
          label: store.name,
        })) ?? []
      }
      searchPlaceholder="Search store..."
      selectedOptions={
        stores.data
          ?.filter((store) => store.id === value)
          .map((store) => ({
            value: store.id,
            label: store.name,
          })) ?? []
      }
      className="w-full"
      height="400px"
      elementHeight={40}
      filter={(option, search) => {
        return option.label.toLowerCase().includes(search.toLowerCase());
      }}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onSelectOption={(option) => {
        setValue(option?.[0]?.value);
        props.setSelectedStore(option?.[0]?.value);
      }}
    />
  );
};
