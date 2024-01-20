import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast.ts";
import { useWallet } from "@/features/aa/WalletContextProvider.tsx";
import { useSafeSdk } from "@/features/aa/useSafeSdk.tsx";
import { trpcClient } from "@/features/trpc-client.ts";
import { authOnboardingRoute } from "@/routes/authRoute.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Route } from "@tanstack/react-router";
import { SiweMessage } from "siwe";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/features/animations.ts";
import { insertStoreSchema } from "ghommerce-schema/src/db/stores.db.ts";

export const indexRoute = new Route({
  getParentRoute: () => authOnboardingRoute,
  path: "/",
  component: () => {
    const user = indexRoute.useRouteContext().session;
    const { web3Auth, web3Modal } = useWallet();
    const walletConnected = !!web3Auth?.address || !!web3Modal?.address;
    const isWalletVerified = trpcClient.verifyWallet.isVerified.useQuery(
      {
        wallet: web3Auth?.address ?? web3Modal?.address,
      },
      {
        enabled: !!web3Auth?.address || !!web3Modal?.address,
      },
    );
    const safes = trpcClient.stores.getSafes.useQuery(
      {
        wallet: web3Auth?.address ?? web3Modal?.address,
      },
      {
        enabled: !!web3Auth?.address || !!web3Modal?.address,
      },
    );
    const stores = trpcClient.stores.getStores.useQuery(
      {
        safeId: safes.data?.[0]?.id,
        userId: user.user.id,
      },
      {
        enabled: !!safes.data?.[0]?.id,
      },
    );

    return (
      <div className="">
        {!walletConnected && <ConnectWalletComponent />}
        {walletConnected && !isWalletVerified.data && <DeploySafeComponent />}
        {safes.data?.[0]?.id && !stores.data?.[0]?.id && (
          <div className="flex justify-center items-center min-h-screen">
            <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
              <CreateStoreComponent safeId={safes.data?.[0]?.id ?? ""} />
            </div>
          </div>
        )}
        {safes.data?.[0]?.id && stores.data?.[0]?.id && (
          <div className="flex justify-center items-center min-h-screen">
            <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>You are ready</CardTitle>
                  <CardDescription>
                    Click continue to go to your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    You can create invoices, payment pages and more from your
                    dashboard
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4">
                  <Link to="/dashboard">
                    <Button>Continue</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  },
});

const ConnectWalletComponent = () => {
  const { web3Auth, web3Modal } = useWallet();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full md:w-auto ml-2 mr-2">
        {/* First Card with Left Animation */}
        <Card className="flex-1 animate-in fade-in zoom-in slide-in-left slide-out-to-left max-w-xl">
          <CardHeader>
            <CardTitle>Existing wallet</CardTitle>
            <CardDescription>Connect your existing wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Web3Pay is powered by Safe Wallet, the connected wallet will be
              safe's initial owner.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center p-4">
            <Button onClick={() => web3Modal?.signIn()}>Connect</Button>
          </CardFooter>
        </Card>

        <Card className="flex-1 animate-in fade-in zoom-in slide-in-left slide-out-to-left max-w-xl">
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Connect to Web3Auth-SafeAuth</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              You will connect to{" "}
              <Link
                href="https://web3auth.io/safeauth.html"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                SafeAuth
              </Link>{" "}
              service to get a wallet. This wallet will be safe's initial owner.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center p-4">
            <Button onClick={() => web3Auth?.signIn()}>
              {web3Auth?.address ? "Connected" : "Connect"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const domain = window.location.host;
const origin = window.location.origin;

const DeploySafeComponent = () => {
  const { signOut, signer, address } = useWallet();
  const queryClient = useQueryClient();
  const safeSdk = useSafeSdk({
    address,
    signer,
    nonce: "0x0",
  });
  const createSafe = trpcClient.stores.registerNewSafe.useMutation({
    onSuccess: async () => {
      console.log("created");
    },
  });
  const getNonce = trpcClient.verifyWallet.getNonce.useMutation();
  const verify = trpcClient.verifyWallet.verify.useMutation({
    onSuccess: async () => {
      console.log("verified");
      if (!address) throw new Error("No address");
      const result = await createSafe.mutateAsync({
        wallet: address,
        safeAddress: safeSdk.safeAddress.data ?? "",
        nonce: "0x0",
        threshold: 1,
        isPredicted: false,
      });
      await queryClient.invalidateQueries();
      console.log("result", result);
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-x-4 flex flex-row">
        {/* First Card with Left Animation */}
        <Card className="flex-1 animate-in fade-in zoom-in slide-in-left slide-out-to-left max-w-md">
          <CardHeader>
            <CardTitle>Your Safe Wallet</CardTitle>
            <CardDescription>
              Your Safe Wallet for receiving payments
            </CardDescription>
          </CardHeader>
          {safeSdk.safeAddress.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <CardContent>
                <div>
                  <p>Safe wallet has been generated for your account</p>
                  <p>Safe Address: {safeSdk.safeAddress?.data}</p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col gap-2">
                  <p>
                    {" "}
                    Sign message with your wallet to verify ownership, and
                    continue to dashboard
                  </p>
                  <p> Signer: {address}</p>
                  <Button
                    onClick={async () => {
                      if (!address) throw new Error("No address");
                      const nonce = await getNonce.mutateAsync({
                        wallet: address,
                      });
                      if (!signer) throw new Error("No signer");
                      const message = new SiweMessage({
                        domain,
                        address,
                        statement: "Sign in with Ethereum to the app.",
                        uri: origin,
                        version: "1",
                        chainId: 1,
                        nonce: nonce,
                      }).prepareMessage();
                      const signature = await signer.signMessage(message);
                      await verify.mutateAsync({
                        wallet: address,
                        message: message,
                        signature,
                      });
                    }}
                  >
                    Verify and Continue
                  </Button>
                  <Button onClick={() => signOut()}>Sign Out</Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export const CreateStoreComponent = (props: {
  safeId?: string;
  onCreated?: () => void;
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const createStore = trpcClient.stores.createNewStore.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Create your store</CardTitle>
        <CardDescription>
          Your store is where you will receive payments, create invoices,
          payment pages and more You can create multiple stores for different
          purposes and manage them all from one place
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AutoForm
          formSchema={insertStoreSchema.omit({
            safeId: true,
            id: true,
          })}
          onSubmit={(data) => {
            if (!props.safeId) {
              toast.toast({
                variant: "destructive",
                title: "No Safe ID",
              });
              return;
            }
            const result = createStore.mutateAsync({
              safeId: props.safeId,
              ...data,
            });
            toast.toast({
              variant: "default",
              title: "Created",
            });
            props.onCreated?.();
            return result;
          }}
        >
          <AutoFormSubmit />
        </AutoForm>
      </CardContent>
    </Card>
  );
};
