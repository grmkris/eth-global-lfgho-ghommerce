import { Route } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { rootRoute } from "./Router.tsx";

export const subPage1 = new Route({
  getParentRoute: () => rootRoute,
  path: "/sub-page-1",
  component: SubPage1,
});

export const SubComponent = () => {
  const account = useAccount();
  return (
    <>
      {account ? (
        <div className="flex flex-col space-y-1">
          <div>Account: {account.address}</div>
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          <div>Account: None</div>
        </div>
      )}
    </>
  );
};

function SubPage1() {
  return (
    <div>
      {" "}
      <w3m-button />
      <SubComponent />
    </div>
  );
}

export const subPage2 = new Route({
  getParentRoute: () => rootRoute,
  path: "/sub-page-2",
  component: SubPage2,
});

function SubPage2() {
  return <div>Hello from SubPage2!</div>;
}

export const subPage3 = new Route({
  getParentRoute: () => rootRoute,
  path: "/sub-page-3",
  component: SubPage3,
});

function SubPage3() {
  return <div>Hello from SubPage3!</div>;
}

export const subPage4 = new Route({
  getParentRoute: () => rootRoute,
  path: "/sub-page-4",
  component: SubPage4,
});

function SubPage4() {
  return <div>Hello from SubPage4!</div>;
}

export const subPage5 = new Route({
  getParentRoute: () => rootRoute,
  path: "/sub-page-5",
  component: SubPage5,
});

function SubPage5() {
  return <div>Hello from SubPage5!</div>;
}
