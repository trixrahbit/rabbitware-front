import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const { authToken, organization } = useAuth();

  useEffect(() => {
    if (!authToken || !organization?.id) {
      console.warn("⚠️ Missing authToken or organization.id, skipping API call.");
      return;
    }

    const fetchClients = async () => {
      try {
        console.log(`📡 Fetching clients for Org ID: ${organization.id}`);
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organization.id}/clients`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("✅ Clients fetched:", response.data);
        setClients(response.data);
      } catch (error) {
        console.error("❌ Error fetching clients:", error.response?.data || error.message);
      }
    };

    fetchClients();
  }, [authToken, organization]);

  return (
    <ClientsContext.Provider value={{ clients, subscription, setClients }}>
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  return useContext(ClientsContext);
};
