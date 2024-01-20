import { GateFiDisplayModeEnum, GateFiSDK } from "@gatefi/js-sdk";
import { useEffect, useRef, useState } from "react";
import { apiTrpc } from "@/trpc-client.ts";
import { Label } from "@/components/ui/label.tsx";

export const Gatefi = () => {
  return (
    <Label
      htmlFor="card"
      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
      id="unlimit-overlay"
    >
      Card
    </Label>
  );
};

export const useGateFi = (props: { donationId?: string }) => {
  const donation = apiTrpc.donations.getDonation.useQuery(
    { donationId: props.donationId },
    { enabled: !!props.donationId },
  );
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const overlayInstanceSDK = useRef<GateFiSDK | null>(null);

  useEffect(() => {
    return () => {
      overlayInstanceSDK.current?.destroy();
      overlayInstanceSDK.current = null;
    };
  }, []);

  const handleOnClick = () => {
    if (!donation.data?.store?.safe?.address)
      throw new Error("No safe address");
    if (overlayInstanceSDK.current) {
      if (isOverlayVisible) {
        overlayInstanceSDK.current.hide();
        setIsOverlayVisible(false);
      } else {
        overlayInstanceSDK.current.show();
        setIsOverlayVisible(true);
      }
    } else {
      overlayInstanceSDK.current = new GateFiSDK({
        merchantId: "b154a828-7274-4949-9643-6a7aa9c8f3b6",
        displayMode: GateFiDisplayModeEnum.Overlay,
        nodeSelector: "#unlimit-overlay",
        isSandbox: true,
        walletAddress: donation.data.store.safe.address,

        externalId: donation.data.id,
        defaultFiat: {
          currency: "USD",
          amount: "10",
        },
        defaultCrypto: {
          currency: "USDC",
        },
        availableFiat: ["USD", "EUR"],
        availableCrypto: ["USDC", "ETH", "USDC_POLYGON"],
        walletLock: true,
        fiatCurrencyLock: true,
        cryptoCurrencyLock: true,
        fiatAmountLock: true,
      });
    }
    overlayInstanceSDK.current?.show();
    setIsOverlayVisible(true);
  };

  return {
    handleOnClick,
  };
};