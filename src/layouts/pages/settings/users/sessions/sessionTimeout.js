import React, { useState, useEffect } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { useAuth } from "context/AuthContext";

const SessionTimeoutSettings = () => {
  const { authToken, user } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState(30); // ✅ Default to 30, fetch actual value later
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user's session timeout from the API
  useEffect(() => {
    const fetchSessionTimeout = async () => {
      if (!authToken || !user?.id) return;

      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/users/${user.id}/session-timeout`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.data.session_timeout !== null) {
          setSessionTimeout(response.data.session_timeout);
        }
      } catch (error) {
        console.error("❌ Error fetching session timeout:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionTimeout();
  }, [authToken, user]);

  // ✅ Handle updates when the user selects a new timeout value
  const handleChange = async (event) => {
    const newTimeout = event.target.value;
    setSessionTimeout(newTimeout);

    try {
      await axios.put(
        `https://app.webitservices.com/api/users/${user.id}/session-timeout`,
        { session_timeout: newTimeout },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Session timeout updated successfully!");
    } catch (error) {
      console.error("❌ Error updating session timeout:", error.response?.data || error.message);
    }
  };

  return (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Session Timeout</InputLabel>
      <Select
        value={sessionTimeout}
        onChange={handleChange}
        sx={{ height: "40px" }} // ✅ Set dropdown height to 40px
        disabled={loading} // ✅ Disable while loading
      >
        <MenuItem value={15}>15 Minutes</MenuItem>
        <MenuItem value={30}>30 Minutes</MenuItem>
        <MenuItem value={60}>1 Hour</MenuItem>
        <MenuItem value={120}>2 Hours</MenuItem>
        <MenuItem value={480}>8 Hours</MenuItem>   {/* ✅ Added */}
        <MenuItem value={1440}>1 Day</MenuItem>    {/* ✅ Added */}
        <MenuItem value={0}>Indefinitely</MenuItem> {/* ✅ Added */}
      </Select>
    </FormControl>
  );
};

export default SessionTimeoutSettings;
