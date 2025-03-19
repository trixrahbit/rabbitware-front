import React, { useState, useEffect } from "react";
import {
  Modal,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "context/AuthContext"; // Adjust import path as needed

// Define two sets of steps:
// For fixed contracts (which may have milestones) vs. block contracts (which do not)
const fixedSteps = [
  "Basic Info",
  "Milestones",
  "Billing & Charges",
  "Services & Bundles",
  "Review",
];
const blockSteps = [
  "Basic Info",
  "Billing & Charges",
  "Services & Bundles",
  "Review",
];

const ContractWizardModal = ({ open, onClose, onComplete }) => {
  const { authToken, user } = useAuth();
  const organizationId = user?.organization_id;

  // Basic contract info state.
  // contract_type is expected to be either "block" or something else (like "fixed")
  const [basicInfo, setBasicInfo] = useState({
    client_id: "",
    pricing: "",
    details: "",
    start_date: "",
    end_date: "",
    contract_type: "", // if "block", then use blockSteps; otherwise, fixedSteps
    contract_category: "",
  });

  const [activeStep, setActiveStep] = useState(0);

  // Dropdown data states
  const [clients, setClients] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [contractCategories, setContractCategories] = useState([]);
  const [billingCodes, setBillingCodes] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);

  // Additional nested data
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({ milestone_name: "", status: "" });
  const [billingInfo, setBillingInfo] = useState({ billing_code: "", financial_details: "" });
  const [selectedService, setSelectedService] = useState("");
  const [selectedBundle, setSelectedBundle] = useState("");

  // Fetch clients
  useEffect(() => {
    if (!organizationId || !authToken) return;
    axios
      .get(`https://app.webitservices.com/api/organizations/${organizationId}/clients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setClients(res.data || []))
      .catch((err) => console.error("Error fetching clients", err));
  }, [organizationId, authToken]);

  // Fetch contract types
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/contract-types", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setContractTypes(res.data || []))
      .catch((err) => console.error("Error fetching contract types", err));
  }, [authToken]);

  // Fetch contract categories
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/contract-categories", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setContractCategories(res.data || []))
      .catch((err) => console.error("Error fetching contract categories", err));
  }, [authToken]);

  // Fetch available billing codes
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/billing-codes", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setBillingCodes(res.data || []))
      .catch((err) => console.error("Error fetching billing codes", err));
  }, [authToken]);

  // Fetch available services
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/contracts/services/available", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setAvailableServices(res.data || []))
      .catch((err) => console.error("Error fetching available services", err));
  }, [authToken]);

  // Fetch available bundles
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/contracts/service-bundles/available", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setAvailableBundles(res.data || []))
      .catch((err) => console.error("Error fetching available bundles", err));
  }, [authToken]);

  // Determine which steps to use based on contract_type.
  // When contract_type is "block" (case-insensitive) use blockSteps.
  const currentSteps =
    basicInfo.contract_type.toLowerCase() === "block" ? blockSteps : fixedSteps;

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Milestone addition
  const addMilestone = () => {
    if (newMilestone.milestone_name.trim() === "" || newMilestone.status.trim() === "") {
      alert("Please fill in both milestone name and status.");
      return;
    }
    setMilestones([...milestones, newMilestone]);
    setNewMilestone({ milestone_name: "", status: "" });
  };

  const handleSubmit = async () => {
    // Compile the full payload.
    const payload = {
      ...basicInfo,
      pricing: basicInfo.pricing ? parseFloat(basicInfo.pricing) : null,
      milestones: milestones,
      // We'll assume billing info goes into a "billing_info" key.
      billing_info: billingInfo,
      selected_service: selectedService,
      selected_bundle: selectedBundle,
      // Ensure nested arrays exist for other relationships even if empty.
      blocks: [],
      fixed_costs: [],
      charges: [],
      exclusions: [],
      rates: [],
      role_costs: [],
      services: [],
      service_bundles: [],
    };

    try {
      const response = await axios.post(
        "https://app.webitservices.com/api/contracts/full",
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("Contract created successfully", response.data);
      onComplete && onComplete(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating contract:", error.response?.data || error.message);
    }
  };

  const renderStepContent = (stepIndex) => {
    const stepLabel = currentSteps[stepIndex];
    switch (stepLabel) {
      case "Basic Info":
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Contract Info
            </Typography>
            <TextField
              fullWidth
              select
              label="Client"
              name="client_id"
              value={basicInfo.client_id}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, client_id: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {clients.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                clients.map((client) => (
                  <MenuItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              fullWidth
              label="Pricing"
              name="pricing"
              type="number"
              value={basicInfo.pricing}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, pricing: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Details"
              name="details"
              value={basicInfo.details}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, details: e.target.value })
              }
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={basicInfo.start_date}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, start_date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={basicInfo.end_date}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, end_date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Contract Type"
              name="contract_type"
              value={basicInfo.contract_type}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, contract_type: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {contractTypes.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                contractTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              fullWidth
              select
              label="Contract Category"
              name="contract_category"
              value={basicInfo.contract_category}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, contract_category: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {contractCategories.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                contractCategories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        );
      case "Milestones":
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Milestones
            </Typography>
            {/* Render a list of added milestones */}
            {milestones.length > 0 ? (
              milestones.map((ms, idx) => (
                <Box key={idx} sx={{ mb: 1, p: 1, border: "1px solid #ccc", borderRadius: "4px" }}>
                  <Typography variant="subtitle1">{ms.milestone_name}</Typography>
                  <Typography variant="body2">Status: {ms.status}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No milestones added.</Typography>
            )}
            {/* Inputs to add a new milestone */}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Milestone Name"
                value={newMilestone.milestone_name}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, milestone_name: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Milestone Status"
                value={newMilestone.status}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, status: e.target.value })
                }
                margin="normal"
              />
              <Button variant="contained" onClick={addMilestone} sx={{ mt: 1 }}>
                Add Milestone
              </Button>
            </Box>
          </Box>
        );
      case "Billing & Charges":
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Billing & Charges
            </Typography>
            <TextField
              fullWidth
              select
              label="Billing Code"
              name="billing_code"
              value={billingInfo.billing_code}
              onChange={(e) =>
                setBillingInfo({ ...billingInfo, billing_code: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {billingCodes.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                billingCodes.map((code) => (
                  <MenuItem key={code.id} value={code.code}>
                    {code.code} - {code.description}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              fullWidth
              label="Financial Details"
              name="financial_details"
              value={billingInfo.financial_details}
              onChange={(e) =>
                setBillingInfo({ ...billingInfo, financial_details: e.target.value })
              }
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        );
      case "Services & Bundles":
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Services & Bundles
            </Typography>
            <TextField
              fullWidth
              select
              label="Select Service"
              name="selected_service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {availableServices.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                availableServices.map((service) => (
                  <MenuItem key={service.id} value={service.id.toString()}>
                    {service.service_name}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              fullWidth
              select
              label="Select Bundle"
              name="selected_bundle"
              value={selectedBundle}
              onChange={(e) => setSelectedBundle(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {availableBundles.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                availableBundles.map((bundle) => (
                  <MenuItem key={bundle.id} value={bundle.id.toString()}>
                    {bundle.bundle_name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        );
      case "Review":
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Contract
            </Typography>
            <pre>{JSON.stringify({ basicInfo, milestones, billingInfo, selectedService, selectedBundle }, null, 2)}</pre>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: { xs: "95%", sm: "1000px", md: "1200px" },
          bgcolor: "background.paper",
          borderRadius: "16px",
          p: 4,
          boxShadow: 24,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {currentSteps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>{renderStepContent(activeStep)}</Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === currentSteps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Submit Contract
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ContractWizardModal;
