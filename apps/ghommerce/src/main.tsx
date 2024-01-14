import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./trpc.ts";

const root = document.getElementById("root");
if (!root) throw new Error("no root element");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
