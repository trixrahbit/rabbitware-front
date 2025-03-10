import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // ✅ Ensure correct import

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const { authToken, organization } = useAuth();  // ✅ Use organization from AuthContext

  useEffect(() => {
    const fetchClients = async () => {
      if (!authToken || !organization?.id) return; // ✅ Ensure we have org info

      try {
        // ✅ Fetch Clients via Organization ID
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organization.id}/clients`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setClients(response.data);

        // ✅ Fetch Subscription (Assuming each org has a single subscription)
        const subscriptionResponse = await axios.get(
          `https://app.webitservices.com/api/organizations/${organization.id}/subscriptions`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setSubscription(subscriptionResponse.data);
      } catch (error) {
        console.error("Error fetching clients or subscription:", error);
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
