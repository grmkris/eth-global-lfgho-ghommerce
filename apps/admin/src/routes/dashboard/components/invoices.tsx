import { DataTable } from "@/components/table/components/data-table";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import {
  insertInvoiceSchema,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { trpcClient } from "@/features/trpc-client.ts";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CommandLoading } from "cmdk";
import { Spinner } from "@/components/ui/Spinner";
import { Chain } from "ghommerce-schema/src/chains.schema";
import { Address } from "ghommerce-schema/src/address.schema";

/** Displays the invoices for a store */
export const StoreInvoices = (props: { data: selectInvoiceSchema[] }) => {
  const columns = generateColumnsFromZodSchema(
    selectInvoiceSchema.pick({
      id: true,
      createdAt: true,
      status: true,
      amountDue: true,
    }),
    {},
    {
      onOpen: (invoice) => {
        console.log(invoice);
        window.open(`http://localhost:5321/invoice?id=${invoice.id}`);
      },
    }
  );

  return (
    <>
      <DataTable data={props.data} columns={columns} />
    </>
  );
};

export const CreateInvoiceComponent = (props: {
  storeId?: string;
  onCreated?: () => void;
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const createInvoice = trpcClient.invoices.createInvoice.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      setIsModalOpen(false);
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<insertInvoiceSchema>();

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button onClick={() => setIsModalOpen(true)}>New invoice</Button>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className={"mt-4 mx-4"}>
          <DialogTitle>Creating new invoice</DialogTitle>
          <DialogDescription>
            Select a wallet to receive payments
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <form>
            <ChainListSelector />
            <Input {...form.register("acceptedTokens.address")} />
          </form>
          {/* <AutoForm
            className={"m-4"}
            formSchema={insertInvoiceSchema.omit({
              storeId: true,
              status: true,
              id: true,
            })}
            onSubmit={(data) => {
              if (!props.storeId) {
                throw new Error("Store ID is required");
              }
              const result = createInvoice.mutateAsync({
                ...data,
                storeId: props.storeId,
                status: "pending",
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
          </AutoForm> */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const ChainListSelector = () => {
  const chains = trpcClient.tokens.getChains.useQuery();
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  return (
    <>
      {selectedChain ? (
        <p className="p-4">
          Selected chain:{" "}
          {
            chains.data?.find((chain) => chain.name === selectedChain)
              ?.displayName
          }
        </p>
      ) : (
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>Chain not found.</CommandEmpty>
            {chains.data?.map((chain) => (
              <CommandItem>
                <button
                  onClick={() => {
                    setSelectedChain(chain.name);
                  }}
                  className="flex flex-row items-center gap-4"
                >
                  <img src={chain.logoURI} className="h-8 w-8" />
                  <span>{chain.displayName}</span>
                </button>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )}

      {selectedChain && <TokenListSelector chainName={selectedChain} />}
    </>
  );
};

const TokenListSelector = ({ chainName }: { chainName: Chain }) => {
  const tokens = trpcClient.tokens.getTokens.useQuery({
    chain: chainName,
  });
  const [selectedToken, setSelectedToken] = useState<Address | null>(null);

  return (
    <>
      {selectedToken ? (
        <div className="p-4 items-center flex flex-row gap-4">
          Selected token:{" "}
          <img
            src={
              tokens.data?.find((token) => token.address === selectedToken)
                ?.logoURI
            }
            className="h-8 w-8"
          />
          {tokens.data?.find((token) => token.address === selectedToken)?.name}
        </div>
      ) : (
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>Chain not found.</CommandEmpty>
            {tokens.data?.map((token) => (
              <CommandItem>
                <button
                  onClick={() => {
                    setSelectedToken(token.address);
                  }}
                  className="flex flex-row items-center gap-4"
                >
                  <img src={token.logoURI} className="h-8 w-8" />
                  <span>{token.name}</span>
                </button>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )}
    </>
  );
};
