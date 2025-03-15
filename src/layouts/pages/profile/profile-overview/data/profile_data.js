import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "context/AuthContext"; // Ensure this path is correct

const useUserInfo = () => {
  const { authToken, user } = useAuth(); // Removed unnecessary `currentOrg`
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!authToken) {
        console.warn("⚠️ No authentication token found. Skipping API call.");
        setIsLoading(false);
        return;
      }

      console.log("🚀 Fetching user info...");
      setIsLoading(true);

      try {
        const response = await axios.get("https://app.webitservices.com/api/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("✅ User Profile API Response:", response.data);
        setUserInfo(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch user info:", err);
        setError(err);
      } finally {
        console.log("🔄 Setting loading to false...");
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserInfo();
    } else {
      console.warn("⚠️ No user data available. Skipping profile fetch.");
      setIsLoading(false);
    }
  }, [authToken, user]); // ✅ Only runs when `authToken` or `user` changes

  return { userInfo, isLoading, error };
};

export { useUserInfo };
