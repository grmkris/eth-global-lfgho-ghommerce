// Example usage
import {
  createEntityRoute,
  generateEntityRouter,
} from "@/features/auto-admin/createEntityRoute.tsx";
import { RootRoute, Route } from "@tanstack/react-router";
import { PlaneIcon, UserIcon } from "lucide-react";
import { insertInvoiceSchema } from "schema/src/db/invoices.ts";
import {
  insertEoaSchema,
  insertPaymentSchema,
  insertSafeSchema,
  selectEoaSchema,
  selectInvoiceSchema,
  selectPaymentSchema,
  selectSafeSchema,
} from "schema/src/db/schema.ts";

const ROUTES = {
  invoices: createEntityRoute({
    id: "invoices",
    selectSchema: selectInvoiceSchema,
    insertSchema: insertInvoiceSchema,
    icon: UserIcon,
    tableConfig: {
      id: {
        enableSorting: true,
      },
      createdAt: {
        enableSorting: true,
      },
    },
  }),
  payments: createEntityRoute({
    id: "payments",
    selectSchema: selectPaymentSchema,
    insertSchema: insertPaymentSchema,
    icon: PlaneIcon,
    tableConfig: {},
  }),
  eoas: createEntityRoute({
    id: "eoas",
    selectSchema: selectEoaSchema,
    insertSchema: insertEoaSchema,
    icon: PlaneIcon,
    tableConfig: {},
  }),
  safes: createEntityRoute({
    id: "safes",
    selectSchema: selectSafeSchema,
    insertSchema: insertSafeSchema,
    icon: PlaneIcon,
    tableConfig: {},
  }),
} as const;
export type AppRouteKey = keyof typeof ROUTES;

export const generateAppConfig = (props: { rootRoute: Route | RootRoute }) => {
  return [
    generateEntityRouter(props.rootRoute, ROUTES.invoices),
    generateEntityRouter(props.rootRoute, ROUTES.payments),
    generateEntityRouter(props.rootRoute, ROUTES.eoas),
    generateEntityRouter(props.rootRoute, ROUTES.safes),
  ];
};

export const SIDEBAR_ROUTES = [
  ROUTES.invoices.id,
  ROUTES.payments.id,
  ROUTES.eoas.id,
  ROUTES.safes.id,
];
