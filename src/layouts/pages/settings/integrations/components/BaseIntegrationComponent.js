import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import MDBox from "components/MDBox";

const BaseIntegrationComponent = ({ integrationName, fields, onSave }) => {
  const [connectionDetails, setConnectionDetails] = useState({});
  const [testStatus, setTestStatus] = useState("");

  const handleInputChange = (e, field) => {
    setConnectionDetails({
      ...connectionDetails,
      [field]: e.target.value,
    });
  };

  const handleTestConnection = async () => {
    // Logic to test the connection
    const isConnected = true; // Replace with actual connection test logic
    setTestStatus(isConnected ? "Connection Successful" : "Connection Failed");
  };

  const handleSave = () => {
    onSave(connectionDetails);
  };

  return (
    <MDBox p={2}>
      <h2>{integrationName}</h2>
      {fields.map((field, index) => (
        <TextField
          key={index}
          label={field.label}
          value={connectionDetails[field.name] || ""}
          onChange={(e) => handleInputChange(e, field.name)}
          fullWidth
          margin="normal"
        />
      ))}
      <Button variant="contained" color="primary" onClick={handleTestConnection}>
        Test Connection
      </Button>
      <Box mt={2}>
        <span>{testStatus}</span>
      </Box>
      <Button variant="contained" color="secondary" onClick={handleSave} fullWidth sx={{ mt: 2 }}>
        Save Integration
      </Button>
    </MDBox>
  );
};

export default BaseIntegrationComponent;
