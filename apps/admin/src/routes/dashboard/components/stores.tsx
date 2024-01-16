import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { cn } from "@/components/utils";
import { trpcClient } from "@/features/trpc-client.ts";
import { CreateStoreComponent } from "@/routes/indexRoute.tsx";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
  CreateInvoiceComponent,
  StoreInvoices,
} from "@/routes/dashboard/components/invoices.tsx";
import { selectInvoiceSchema } from "ghommerce-schema/src/db/invoices.ts";

export const Stores = (props: {
  userId: string;
}) => {
  const stores = trpcClient.stores.getStores.useQuery({
    userId: props.userId,
  });
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    undefined,
  );
  const invoices = trpcClient.stores.getInvoices.useQuery(
    {
      storeId: selectedStoreId,
    },
    { enabled: !!selectedStoreId },
  );

  const handleSelectStore = (id: string) => {
    setSelectedStoreId(id);
  };

  return (
    <>
      <CreateStoreModal />
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-11/12 mx-auto"
      >
        <CarouselContent>
          {stores.data?.map((store) => (
            <CarouselItem key={store.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card
                  onClick={() => handleSelectStore(store.id)}
                  className={`card hover:shadow-lg ${
                    selectedStoreId === store.id ? "bg-blue-100" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {store.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="text-sm text-gray-500">
                      <div>{store.name}</div>
                      <div>{store.description}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {selectedStoreId && <CreateInvoiceComponent storeId={selectedStoreId} />}
      {invoices.data && (
        <div>
          <StoreInvoices
            data={selectInvoiceSchema.array().parse(invoices.data)}
          />
        </div>
      )}
    </>
  );
};

const CreateStoreModal = () => {
  const safes = trpcClient.stores.getSafes.useQuery();
  const [selectedSafe, setSelectedSafe] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button onClick={() => setIsModalOpen(true)}>Create Store</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creating new store</DialogTitle>
        </DialogHeader>
        <div className="text-sm font-medium mb-2">
          Select a wallet to receive payments
        </div>
        {safes.data && (
          <SafesDropdown
            safes={safes.data.map((x) => {
              return {
                value: x.id,
                label: x.address,
              };
            })}
            onChange={(value) => setSelectedSafe(value)}
          />
        )}

        <CreateStoreComponent
          safeId={selectedSafe}
          onCreated={() => {
            setIsModalOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const SafesDropdown = (props: {
  safes: { value: string; label: string }[];
  onChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? props.safes.find((safe) => safe.value === value)?.label
            : "Select a wallet to receive payments"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search wallet..." className="h-9" />
          <CommandEmpty>No wallet found.</CommandEmpty>
          <CommandGroup>
            {props.safes.map((safe) => (
              <CommandItem
                key={safe.value}
                value={safe.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                  props.onChange?.(currentValue);
                }}
              >
                {safe.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === safe.value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
