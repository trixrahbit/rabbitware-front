import React, { useState, useEffect } from "react";
import DataTable from "../../../../../examples/Tables/DataTable";
import { useAuth } from "../../../../../context/AuthContext";
import { useClients } from "../../../../../context/ClientsContext";
import MDBox from "../../../../../components/MDBox";
import MDButton from "../../../../../components/MDButton";
import { Tooltip, Grid, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddClientModal from "./AddClientModal";
import ClientDetailsModal from "./ClientDetailModal";
import axios from "axios";

// Define columns for the clients table
const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const ClientsData = () => {
  const { clients, setClients } = useClients();
  const { authToken, organization } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

const fetchClients = async () => {
  if (!organization?.id) return; // Ensure org is available
  setLoading(true);
  try {
    const response = await axios.get(
      `https://app.webitservices.com/api/organizations/${organization.id}/clients`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    setClients(response.data);
  } catch (error) {
    console.error("Error fetching clients:", error);
  }
  setLoading(false);
};

// ✅ Call `fetchClients` inside useEffect
useEffect(() => {
  fetchClients();
}, [setClients, authToken, organization]);




  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenDetailsModal = (client) => {
    setSelectedClient(client);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedClient(null);
  };

const handleSaveClient = async (clientData) => {
  console.log("🚀 Sending Client Data:", clientData);

  if (!clientData.organization_id) {
    console.error("❌ Organization ID is missing!");
    return;
  }

  try {
    const response = await axios.post(
      `https://app.webitservices.com/api/organizations/${clientData.organization_id}/clients`,
      clientData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log("✅ Client saved successfully:", response.data);
    fetchClients(); // ✅ Now it's correctly defined and reusable
    handleCloseModal();
  } catch (error) {
    console.error("❌ Error adding client:", error.response?.data || error.message);
  }
};



  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MDBox position="relative">
      {/* Toolbar: Search, Filter, Add Client Button */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Search Field */}
        <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Clients"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#eeeeee" },
              }}
            />
          </Grid>

          {/* Filter Button */}
          <Grid item xs={6} md={3}>
            <MDButton variant="outlined" color="primary" startIcon={<FilterListIcon />} sx={{ width: "100%" }}>
              Filter
            </MDButton>
          </Grid>
        </Grid>

        {/* Add Client Button */}
        <Tooltip title="Add Client">
          <MDButton variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Add Client
          </MDButton>
        </Tooltip>
      </MDBox>

      {/* Data Table */}
      <DataTable
        table={{
          columns: clientColumns,
          rows: filteredClients.map(client => ({
            ...client,
            name: (
              <button
                onClick={() => handleOpenDetailsModal(client)}
                style={{ textDecoration: "none", border: "none", background: "none", padding: 0, color: "blue", cursor: "pointer" }}
              >
                {client.name}
              </button>
            ),
          })),
        }}
        isLoading={loading}
      />

      {/* Modals */}
      {isModalOpen && <AddClientModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveClient} />}
      {detailsModalOpen && selectedClient && <ClientDetailsModal open={detailsModalOpen} onClose={handleCloseDetailsModal} client={selectedClient} />}
    </MDBox>
  );
};

export default ClientsData;
