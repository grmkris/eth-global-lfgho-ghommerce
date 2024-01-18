import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DateRangePicker } from "@/components/ui/date-range-picker.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/routes/dashboard/components/overview.tsx";
import { StoresWrapper } from "@/routes/dashboard/components/stores.tsx";
import { ViewOption, dashboardRoute } from "@/routes/dashboardRoute.tsx";
import { useRouter } from "@tanstack/react-router";
import { RecentSales } from "./components/recent-sales";
import { UserNav } from "@/layout";
import { Loader, Receipt } from "lucide-react";
import { trpcClient } from "@/features/trpc-client.ts";
import { CreateStoreModal } from "./components/stores/createStore.modal";
import { dateToTextString } from "@/utils/date";

export const DashboardPage = () => {
  const selectedView = dashboardRoute.useSearch().view;
  const userId = dashboardRoute.useRouteContext().session;
  const stores = trpcClient.stores.getStores.useQuery({
    userId: userId.user.id,
  });
  const router = useRouter();
  return (
    <Tabs
      defaultValue={selectedView ?? "Overview"}
      className="space-y-4"
      onValueChange={(value) => {
        router.navigate({
          search: {
            view: value,
          },
        });
      }}
    >
      <div className="flex flex-col mx-2">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <TabsList>
              <TabsTrigger value={ViewOption.enum.Overview}>
                Overview
              </TabsTrigger>
              <TabsTrigger value={ViewOption.enum.Stores}>Stores</TabsTrigger>
              <TabsTrigger value={ViewOption.enum.Integrations}>
                Integrations
              </TabsTrigger>
              <TabsTrigger value={ViewOption.enum.Notifications}>
                Notifications
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <DateRangePicker />
              {/* <Button>Download</Button>
              <Button>New Payment</Button> */}
              <div className="pl-4">
                <UserNav />
              </div>
            </div>
          </div>

          <TabsContent value={ViewOption.enum.Overview} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your stores
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {stores.isFetching || stores.isLoading ? (
                    <div className="relative">
                      <div className="absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
                        <Loader
                          className="animate-spin"
                          size={24}
                          color="gray"
                        />
                      </div>
                    </div>
                  ) : stores.data && stores?.data?.length > 0 ? (
                    <Carousel>
                      <CarouselContent>
                        {stores.data.map((store) => (
                          <CarouselItem>
                            <SafeWalletCard
                              storeId={store.id}
                              name={store.name}
                              balance={"100"}
                              lastTransaction={
                                store?.updatedAt
                                  ? new Date(store.updatedAt)
                                  : new Date()
                              }
                            />{" "}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    <div className="relative">
                      <div className="absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
                        <CreateStoreModal />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value={ViewOption.enum.Stores} className="space-y-4">
            <StoresWrapper userId={userId.user.id} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

const SafeWalletCard = (props: {
  storeId: string;
  name: string;
  balance: string;
  lastTransaction: Date;
}) => {
  const invoices = trpcClient.invoices.getInvoices.useQuery({
    storeId: props.storeId,
  });

  const total = invoices.data?.reduce(
    (acc, current) => acc + current.amountDue,
    0
  );

  return (
    <div className="bg-gray-100 rounded-lg shadow-md text-black p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold">{props.name}</h2>
        </div>
        <Receipt />
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-2xl font-bold">{total?.toFixed(2)} USD</p>
        <p className="text-xs">
          Last Transaction: {dateToTextString(props.lastTransaction)}
        </p>
      </div>
    </div>
  );
};
