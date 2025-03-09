import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Adjust the import path as necessary

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [subscription, setSubscription] = useState(null);  // Add subscription state
  const { authToken, user } = useAuth();

useEffect(() => {
  const fetchClients = async () => {
    try {
      const response = await axios.get("https://app.webitservices.com/get_clients", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setClients(response.data);

      // Assuming that user has a client_id that you can use to fetch the subscription
      if (response.data.length > 0) {
        const clientId = response.data[0].id; // Replace 0 with the appropriate index if multiple clients
        const subscriptionResponse = await axios.get(`https://app.webitservices.com/clients/${clientId}/subscriptions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setSubscription(subscriptionResponse.data);
      }
    } catch (error) {
      console.error("Error fetching clients or subscription:", error);
    }
  };

  if (authToken) {
    fetchClients();
  }
}, [authToken]);


  return (
    <ClientsContext.Provider value={{ clients, subscription, setClients }}>
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  return useContext(ClientsContext);
};
