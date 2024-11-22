import React, { useState } from "react";
import {
  Grid, Paper, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import MDBox from "../../../../components/MDBox";
import MDButton from "../../../../components/MDButton";
import AutotaskIntegration from "./autotaskpsa/AutotaskIntegration";
import DattoRMMIntegration from "./dattormm/DattoRMMIntegration";
import CustomAPIIntegration from "./customapi/CustomAPIIntegration";

// Installed integrations (sample data)
const installedIntegrations = [
  // Add actual installed integrations here, e.g., { id: 1, name: "Google Drive" },
];

// Available integrations from the database
const availableIntegrations = [
  { id: 1, name: "Autotask PSA" },
  { id: 2, name: "Datto RMM" },
  { id: 3, name: "Auvik" },
  { id: 4, name: "Microsoft Graph" },
  { id: 5, name: "Custom API" },
];

const IntegrationPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedIntegration(null);
    setConnectionDetails({});
    setTestResult(null);
  };

  const handleIntegrationSelect = (integration) => {
    setSelectedIntegration(integration);
    setConnectionDetails({});
    setTestResult(null);
  };

  const handleInputChange = (e) => {
    setConnectionDetails({
      ...connectionDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestConnection = () => {
    setIsTesting(true);

    // Simulate connection testing
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("Connection Successful!"); // or "Connection Failed!"
    }, 2000);
  };

  const handleSaveIntegration = () => {
    // Logic to save the connection details to the database
    console.log("Saving integration:", selectedIntegration, connectionDetails);
    handleClose();
  };

  const renderIntegrationForm = () => {
    switch (selectedIntegration?.name) {
      case "Autotask PSA":
        return <AutotaskIntegration connectionDetails={connectionDetails} handleInputChange={handleInputChange} />;
      case "Datto RMM":
        return <DattoRMMIntegration connectionDetails={connectionDetails} handleInputChange={handleInputChange} />;
      case "Custom API":
        return <CustomAPIIntegration connectionDetails={connectionDetails} handleInputChange={handleInputChange} />;
      default:
        return <Typography>Please select an integration.</Typography>;
    }
  };

  // Filter out installed integrations from available integrations
  const uninstalledIntegrations = availableIntegrations.filter(
    (integration) => !installedIntegrations.find((inst) => inst.name === integration.name)
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} p={2} component={Paper}>
        <Typography variant="h4" mb={2}>
          Installed Integrations
        </Typography>
        <Grid container spacing={3}>
          {installedIntegrations.length > 0 ? (
            installedIntegrations.map((integration) => (
              <Grid item xs={12} md={4} key={integration.id}>
                <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
                  <Typography variant="h6">{integration.name}</Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Integration Details: {integration.name}
                  </Typography>
                </MDBox>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" textAlign="center" width="100%">
              No integrations installed.
            </Typography>
          )}
        </Grid>
        <MDBox mt={4} textAlign="center">
          <MDButton variant="contained" color="info" startIcon={<AddIcon />} onClick={handleOpen}>
            Add Integration
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Add Integration Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Integration</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Select an Integration
          </Typography>
          <Grid container spacing={2}>
            {uninstalledIntegrations.length > 0 ? (
              uninstalledIntegrations.map((integration) => (
                <Grid item xs={12} key={integration.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      padding: "16px",
                      borderRadius: "8px",
                      border: selectedIntegration?.id === integration.id ? "2px solid #3f51b5" : "1px solid #ccc",
                      transition: "border-color 0.3s",
                    }}
                    onClick={() => handleIntegrationSelect(integration)}
                  >
                    <Typography variant="h6">{integration.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {integration.description || `Configure ${integration.name}`}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" textAlign="center" width="100%">
                All available integrations are installed.
              </Typography>
            )}
          </Grid>

          {selectedIntegration && (
            <MDBox mt={3}>
              <Typography variant="h6" mb={2}>
                Connection Details for {selectedIntegration.name}
              </Typography>
              {renderIntegrationForm()}
              <MDButton
                variant="contained"
                color="secondary"
                onClick={handleTestConnection}
                disabled={isTesting}
                sx={{ mt: 2 }}
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </MDButton>
              {testResult && (
                <Typography variant="body2" color="success.main" mt={2}>
                  {testResult}
                </Typography>
              )}
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClose}>Cancel</MDButton>
          <MDButton onClick={handleSaveIntegration} color="primary" disabled={!testResult}>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
};

export default IntegrationPage;
