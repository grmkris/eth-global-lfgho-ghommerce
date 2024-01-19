import { authRoute } from "@/routes/authRoute.tsx";
import { DashboardPage } from "@/routes/dashboard/DashboardComponent.tsx";
import { Route } from "@tanstack/react-router";
import { z } from "zod";

const viewOptions = [
  "Overview",
  "Stores",
  "Applications",
  "Notifications",
] as const;
export const ViewOption = z.enum(viewOptions);
export type ViewOption = (typeof viewOptions)[number];

export const dashboardRoute = new Route({
  getParentRoute: () => authRoute,
  path: "/dashboard",
  validateSearch: z.object({
    view: ViewOption.optional(),
  }),
  component: DashboardPage,
});
