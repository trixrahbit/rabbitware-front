import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const { authToken, user } = useAuth();

  useEffect(() => {
    if (!authToken || !user?.organization?.id) {
      console.warn("⚠️ Missing authToken or organization id, skipping API call.");
      return;
    }

    let isMounted = true;

    const fetchClients = async () => {
      try {
        console.log(`📡 Fetching clients for Org ID: ${user.organization.id}`);
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${user.organization.id}/clients`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (isMounted) {
          // ✅ Only update if the data has changed
          if (JSON.stringify(response.data) !== JSON.stringify(clients)) {
            console.log("✅ Updating clients state");
            setClients(response.data);
          } else {
            console.log("⚠️ No change in clients data, skipping state update.");
          }
        }
      } catch (error) {
        console.error("❌ Error fetching clients:", error.response?.data || error.message);
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, [authToken, user?.organization?.id]); // ✅ Only runs when necessary

  return (
    <ClientsContext.Provider value={{ clients, setClients, subscription }}>
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  return useContext(ClientsContext);
};
