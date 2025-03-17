import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Grid, TextField, InputAdornment, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DataTable from "../../../../../examples/Tables/DataTable";

import { useAuth } from "../../../../../context/AuthContext";
import { useClients } from "../../../../../context/ClientsContext";

import MDBox from "../../../../../components/MDBox";
import MDTypography from "../../../../../components/MDTypography";
import MDButton from "../../../../../components/MDButton";

import AddClientModal from "./AddClientModal";
import ClientDetailsModal from "./ClientDetailModal";

const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

function ClientsData() {
  const { clients, setClients } = useClients();
  const { authToken, organization } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────
  // Fetch Clients
  // ─────────────────────────────────────────────────────────
  const fetchClients = async () => {
    if (!organization?.id) return; // Skip if no org ID
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

  useEffect(() => {
    fetchClients();
  }, [authToken, organization]);

  // ─────────────────────────────────────────────────────────
  // Modals Handlers
  // ─────────────────────────────────────────────────────────
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
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error adding client:", error.response?.data || error.message);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────
  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [clients, searchQuery]
  );

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <MDBox p={3}>




      {/* Clients Data Table */}
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
  entriesPerPage={{ defaultValue: 10, options: [10, 25, 50, 100] }}
  showTotalEntries
  customHeader={(
    <MDBox display="flex" justifyContent="space-between" alignItems="center" width="100%">
      {/* ✅ Center: Search & Filter */}
      <MDBox display="flex" alignItems="center" gap={2} justifyContent="center" flexGrow={1}>
        <TextField
          placeholder="Search Clients"
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
            maxWidth: "250px", // ✅ Proper width
          }}
        />
        <MDButton variant="outlined" color="secondary" startIcon={<FilterListIcon />}>
          Filter
        </MDButton>
      </MDBox>



    </MDBox>
  )}
/>




      {/* Modals */}
      {isModalOpen && (
        <AddClientModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveClient}
        />
      )}
      {detailsModalOpen && selectedClient && (
        <ClientDetailsModal
          open={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          client={selectedClient}
        />
      )}
    </MDBox>
  );
}

export default ClientsData;
