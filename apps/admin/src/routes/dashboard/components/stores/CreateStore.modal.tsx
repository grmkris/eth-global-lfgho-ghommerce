import { trpcClient } from "@/features/trpc-client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import { SafesDropdown } from "./SafesDropdown";
import { CreateStoreComponent } from "@/routes/indexRoute";
import { Button } from "@/components/ui/button.tsx";

export const CreateStoreModal = () => {
  const safes = trpcClient.stores.getSafes.useQuery();
  const [selectedSafe, setSelectedSafe] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button size={"icon"} variant={"ghost"}>
        <PlusCircleIcon size={64} onClick={() => setIsModalOpen(true)} />
      </Button>
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
