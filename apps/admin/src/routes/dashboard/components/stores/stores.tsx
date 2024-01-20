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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { trpcClient } from "@/features/trpc-client.ts";

import { useState } from "react";
import { StoreInvoices } from "@/routes/dashboard/components/invoices.tsx";
import { selectInvoiceSchema } from "ghommerce-schema/src/db/invoices.ts";
import { MoreHorizontal } from "lucide-react";
import { CreateStoreModal } from "./createStore.modal";

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

  stores.data?.[0].safe.eoas[0].eoa.wallet; // EOA owner of safe

  stores.data?.[0].safe.address; // Safe wallet address <-- use this to receive payments

  if (stores.isFetching || stores.isLoading) return <p>Loading...</p>;

  if (stores.data && stores.data?.length > 0)
    return <Stores stores={stores.data} />;
};

const Stores = (props: { stores: Store[] }) => {
  const { stores } = props;

  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    stores[0].id,
  );
  const invoices = trpcClient.invoices.getInvoices.useQuery(
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
