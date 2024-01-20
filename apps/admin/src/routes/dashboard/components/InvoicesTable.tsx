import { DataTable } from "@/components/table/components/data-table";
import { generateColumnsFromZodSchema } from "@/components/table/generateColumnsFromZodSchema.tsx";
import { selectInvoiceSchema } from "ghommerce-schema/src/db/invoices.db.ts";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Dialog } from "@/components/ui/dialog.tsx";

import { CreateInvoiceForm } from "./stores/CreateInvoiceForm";
import { CopyAddressLabel } from "@/components/web3/CopyAddressLabel.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { InvoiceStatus } from "ghommerce-schema/src/invoice.schema.ts";
import { useApplicationModals } from "@/routes/dashboard/components/applications/useApplicationModals.tsx";

const InvoiceStatusBadge = (props: { status: InvoiceStatus }) => {
  switch (props.status) {
    case "paid":
      return <Badge variant="default">Paid</Badge>;
    case "pending":
      return <Badge variant="outline">Unpaid</Badge>;
    case "handled":
      return <Badge variant="secondary">Handled</Badge>;
  }
};

/** Displays the invoices for a store */
export const InvoicesTable = (props: {
  data: selectInvoiceSchema[];
  selectedStoreId: string;
}) => {
  const modal = useApplicationModals((state) => state.open);
  const columns = generateColumnsFromZodSchema(
    selectInvoiceSchema.pick({
      id: true,
      description: true,
      createdAt: true,
      status: true,
      amountDue: true,
      payerWallet: true,
      payerEmail: true,
    }),
    {
      payerWallet: {
        render: (value) => {
          return value.payerWallet ? (
            <CopyAddressLabel address={value.payerWallet} />
          ) : (
            <span>Unknown</span>
          );
        },
      },
      status: {
        render: (value) => {
          return <InvoiceStatusBadge status={value.status} />;
        },
      },
    },
    {
      onOpen: (invoice) => {
        console.log(invoice);
        window.open(`http://localhost:5321/invoice?id=${invoice.id}`);
      },
    },
  );

  return (
    <>
      <DataTable
        data={props.data}
        columns={columns}
        rightToolbarActions={
          <Button size={"sm"} onClick={() => modal("donations")}>
            New invoice
          </Button>
        }
      />
    </>
  );
};

export const CreateInvoiceComponent = (props: {
  storeId?: string;
  onCreated?: () => void;
}) => {
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
      <CreateInvoiceForm
        storeId={props.storeId ?? ""}
        onClose={() => setIsModalOpen(false)}
      />
    </Dialog>
  );
};
