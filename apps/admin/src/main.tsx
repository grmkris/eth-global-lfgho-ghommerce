import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { App } from "@/App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("no root element");
ReactDOM.createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
