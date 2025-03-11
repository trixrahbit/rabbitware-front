import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "context/AuthContext";
import { MaterialUIControllerProvider } from "context";
import { ClientsProvider } from "./context/ClientsContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ClientsProvider>
          <MaterialUIControllerProvider>
            <App />
          </MaterialUIControllerProvider>
        </ClientsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
