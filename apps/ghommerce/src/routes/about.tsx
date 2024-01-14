import { Route } from "@tanstack/react-router";
import { rootRoute } from "./Router.tsx";

export const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

function About() {
  return <div>Hello from About!</div>;
}
