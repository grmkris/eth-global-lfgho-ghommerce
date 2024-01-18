import { DataTable } from "@/components/table/components/data-table";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import {
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { trpcClient } from "@/features/trpc-client.ts";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Dialog } from "@/components/ui/dialog.tsx";

import { useQueryClient } from "@tanstack/react-query";
import { CreateInvoiceForm } from "./stores/CreateInvoiceForm";

/** Displays the invoices for a store */
export const StoreInvoices = (props: {
  data: selectInvoiceSchema[];
  selectedStoreId: string;
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
    }
  );

  return (
    <>
      <DataTable
        data={props.data}
        columns={columns}
        rightToolbarActions={
          <>
            <CreateInvoiceComponent storeId={props.selectedStoreId} />
          </>
        }
      />
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

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button
        size={"sm"}
        className="whitespace-nowrap h-8"
        onClick={() => setIsModalOpen(true)}
      >
        New invoice
      </Button>
      <CreateInvoiceForm />
    </Dialog>
  );
};
