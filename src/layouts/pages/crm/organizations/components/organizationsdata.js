import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { useAuth } from "context/AuthContext";
import MDBox from "components/MDBox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import AddOrgModal from "./AddOrgModal";
import ClientDetailsModal from "./OrgDetailModal";

const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const OrganizationsData = ({ onStatsFetched }) => {
  const [clients, setClients] = useState([]);
  const { authToken, currentOrg } = useAuth(); // Destructuring currentOrg from context
  const clientId = currentOrg?.id;  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orgStats, setOrgStats] = useState({
    total: 0,
    percentageChange: 0,
  });


const fetchClients = async () => {
  if (!clientId) {
    console.log("clientId is missing.");
    return; // Make sure clientId is not undefined/null
  }
  console.log(`Fetching organizations for clientId: ${clientId} with authToken: ${authToken}`);
  try {
    const response = await axios.get(`https://app.webitservices.com/api/${clientId}/organizations/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(response.data); // Check the response
    setClients(response.data);
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
};


  useEffect(() => {
    fetchClients();
  }, [authToken, clientId]); // Re-fetch when authToken or clientId changes


const handleSaveOrg = async (orgData) => {
  const dataToSend = {
    ...orgData,
    //client_id: clientId, // Uncomment if your backend expects client_id in the body
  };
console.log("Sending organization data:", dataToSend);

  try {
    const response = await axios.post(`https://app.webitservices.com/api/${clientId}/organizations/`, dataToSend, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("Saved organization:", response.data);
    fetchClients(); // Re-fetch organizations after saving
  } catch (error) {
    console.error("Error saving organization:", error);
  }
};





  return (
    <MDBox pt={3}> {/* Adjust padding as needed */}
      <Tooltip title="Add Client" placement="right">
        <IconButton
          onClick={() => setIsModalOpen(true)}
          color="primary"
          sx={{
            position: "absolute",
            right: "24px",
            top: "-50px", // Adjust as needed based on your layout
            backgroundColor: "info.main",
            "&:hover": { backgroundColor: "info.dark" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        table={{
          columns: clientColumns,
          rows: clients.map((client) => ({
            ...client,
            name: (
              <button
                onClick={() => {
                  setSelectedClient(client);
                  setDetailsModalOpen(true);
                }}
                style={{ textDecoration: "none", border: "none", background: "none", padding: 0, color: "blue", cursor: "pointer" }}
              >
                {client.name}
              </button>
            ),
          })),
        }}
      />
      {isModalOpen && (
        <AddOrgModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveOrg} />
      )}
      {detailsModalOpen && selectedClient && (
        <ClientDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />
      )}
    </MDBox>
  );
};

export default OrganizationsData;
