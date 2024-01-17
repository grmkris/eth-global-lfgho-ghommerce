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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StoreInvoices } from "@/routes/dashboard/components/invoices.tsx";
import { selectInvoiceSchema } from "ghommerce-schema/src/db/invoices.ts";
import { MoreHorizontal, PlusCircleIcon } from "lucide-react";

export type Store = {
  description: string;
  id: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
  userId: string;
  safeId: string;
};

export const StoresWrapper = (props: { userId: string }) => {
  const stores = trpcClient.stores.getStores.useQuery({
    userId: props.userId,
  });

  if (stores.isFetching || stores.isLoading) return <p>Loading...</p>;

  if (stores.data && stores.data?.length > 0)
    return <Stores stores={stores.data} />;
};

const Stores = (props: { stores: Store[] }) => {
  const { stores } = props;

  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    stores[0].id
  );
  const invoices = trpcClient.invoices.getInvoices.useQuery(
    {
      storeId: selectedStoreId,
    },
    { enabled: !!selectedStoreId }
  );

  const handleSelectStore = (id: string) => {
    setSelectedStoreId(id);
  };

  return (
    <>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-11/12 mx-auto"
      >
        <CarouselPrevious />
        <CarouselContent className="px-4">
          <div className="flex h-auto justify-center items-center ">
            <CreateStoreModal />
          </div>
          {stores?.map((store) => (
            <CarouselItem key={store.id} className="md:basis-1/2 lg:basis-1/5">
              <div className="p-1">
                <Card
                  onClick={() => handleSelectStore(store.id)}
                  className={`card hover:shadow-md ${
                    selectedStoreId === store.id ? "bg-gray-100" : ""
                  } p-2 rounded-3xl`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {store.name}
                    </CardTitle>
                    <DropdownMenu dir="ltr">
                      <DropdownMenuTrigger asChild>
                        <MoreHorizontal
                          color="gray"
                          className="hover:cursor-pointer"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1 text-gray-500">
                      <p className="text-2xl font-semibold">$ 1450.00</p>
                      <p className="text-sm">{store.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
      {!selectedStoreId && <p>no data</p>}
      {invoices.data && selectedStoreId && (
        <div>
          <StoreInvoices
            data={selectInvoiceSchema.array().parse(invoices.data)}
            selectedStoreId={selectedStoreId}
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
      <PlusCircleIcon
        size={64}
        color="gray"
        className="hover:cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      />
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
                    value === safe.value ? "opacity-100" : "opacity-0"
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
