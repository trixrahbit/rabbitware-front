import React, { useState, useEffect } from "react";
import DataTable from "../../../../../examples/Tables/DataTable";
import { useAuth } from "../../../../../context/AuthContext";
import { useClients } from "../../../../../context/ClientsContext";
import MDBox from "../../../../../components/MDBox";
import MDTypography from "../../../../../components/MDTypography";
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

  // ✅ Fetch clients from API
  const fetchClients = async () => {
    if (!organization?.id) return; // Ensure org ID exists
    setLoading(true);
    try {
      const response = await axios.get(
        `https://app.webitservices.com/api/organizations/${organization.id}/clients`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setClients(response.data);
    } catch (error) {
      console.error("❌ Error fetching clients:", error);
    }
    setLoading(false);
  };

  // ✅ Run fetchClients when the component mounts
  useEffect(() => {
    fetchClients();
  }, [authToken, organization]);

  // ✅ Handle opening and closing of modals
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

  // ✅ Handle saving a new client
  const handleSaveClient = async (clientData) => {
    console.log("🚀 Adding Client:", clientData);
    if (!clientData.organization_id) {
      console.error("❌ Organization ID is missing!");
      return;
    }
    try {
      await axios.post(
        `https://app.webitservices.com/api/organizations/${clientData.organization_id}/clients`,
        clientData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fetchClients(); // Refresh client list
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error adding client:", error.response?.data || error.message);
    }
  };

  // ✅ Filter clients based on search input
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MDBox position="relative" p={3}>
      {/* 🔹 Search & Filter Toolbar */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          {/* Search Bar */}
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
                backgroundColor: "background.paper",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "background.default" },
              }}
            />
          </Grid>

          {/* Filter Button */}
          <Grid item xs={6} md={3}>
            <MDButton variant="outlined" color="secondary" startIcon={<FilterListIcon />} sx={{ width: "100%" }}>
              Filter
            </MDButton>
          </Grid>
        </Grid>

        {/* Add Client Button */}
        <Tooltip title="Add Client">
          <MDButton variant="contained" color="info" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Add Client
          </MDButton>
        </Tooltip>
      </MDBox>

      {/* 🔹 Clients Data Table */}
      <DataTable
        table={{
          columns: clientColumns,
          rows: filteredClients.map((client) => ({
            ...client,
            name: (
              <MDTypography
                variant="button"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "none" }}
                onClick={() => handleOpenDetailsModal(client)}
              >
                {client.name}
              </MDTypography>
            ),
          })),
        }}
        isLoading={loading}
      />

      {/* 🔹 Modals */}
      {isModalOpen && <AddClientModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveClient} />}
      {detailsModalOpen && selectedClient && <ClientDetailsModal open={detailsModalOpen} onClose={handleCloseDetailsModal} client={selectedClient} />}
    </MDBox>
  );
};

export default ClientsData;
