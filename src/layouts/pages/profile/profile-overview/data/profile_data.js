import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from 'context/AuthContext'; // Ensure this path is correct

const useUserInfo = () => {
  const { authToken, user, currentOrg } = useAuth(); // Using user and currentOrg from the context
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!authToken || !user || !currentOrg) return;

      setIsLoading(true);
      try {
        // Assuming userID and orgID are stored in user and currentOrg objects respectively
        const userId = user?.id; // Adjust according to your user object structure
        const orgId = currentOrg?.id; // Adjust according to your organization object structure

        const response = await axios.get(`https://app.webitservices.com/api/organizations/${orgId}/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserInfo(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError(err);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [authToken, user, currentOrg]); // Depend on user and currentOrg from the context

  return { userInfo, isLoading, error };
};

export { useUserInfo };


