import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "context/AuthContext";
import { MaterialUIControllerProvider } from "context";
import { ClientsProvider } from "./context/ClientsContext";

const container = document.getElementById("root");

if (!container) {
  console.error("❌ Root container not found. Ensure <div id='root'></div> exists in index.html.");
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <ClientsProvider>
          <MaterialUIControllerProvider>
            <App /> {/* ✅ App handles BrowserRouter */}
          </MaterialUIControllerProvider>
        </ClientsProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}




