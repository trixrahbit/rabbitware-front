import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";

const useContacts = (clientId) => {
  const { authToken, user } = useAuth();
  const organizationId = user?.organization_id;

  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authToken || !organizationId || !clientId) return;

    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organizationId}/clients/${clientId}/contacts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setContacts(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching contacts:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [authToken, organizationId, clientId]);

  return { contacts, isLoading, error };
};

export { useContacts };
