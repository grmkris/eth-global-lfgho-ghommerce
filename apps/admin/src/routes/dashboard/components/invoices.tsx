import { DataTable } from "@/components/table/components/data-table";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import {
  insertInvoiceSchema,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { trpcClient } from "@/features/trpc-client.ts";
import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

/** Displays the invoices for a store */
export const StoreInvoices = (props: {
  data: selectInvoiceSchema[];
}) => {
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
    },
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
  const createInvoice = trpcClient.stores.createInvoice.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      setIsModalOpen(false);
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <AutoForm
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
          </AutoForm>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
