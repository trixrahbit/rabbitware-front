import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "context/AuthContext";

const useContacts = (clientId) => {
  const { authToken, user } = useAuth();
  const orgId = user?.organization_id;

  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authToken || !orgId || !clientId) return;

    let isMounted = true;

    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientId}/contacts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (isMounted) setContacts(response.data || []);
      } catch (err) {
        console.error("❌ Error fetching contacts:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchContacts();

    return () => {
      isMounted = false; // ✅ Cleanup to prevent unwanted updates
    };
  }, [authToken, orgId, clientId]); // ✅ Dependencies

  return { contacts, isLoading, error, setContacts };
};

export { useContacts };
