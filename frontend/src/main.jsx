import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import { ProcurementProvider } from "./context/ProcurementContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ProcurementProvider>
        <App />
      </ProcurementProvider>
    </AuthProvider>
  </BrowserRouter>,
);
