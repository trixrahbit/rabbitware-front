import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "../../../../../examples/Tables/DataTable";
import axios from "axios";
import { useClients } from "../../../../../context/ClientsContext";
import { useAuth } from "context/AuthContext";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AddClientModal from "./AddClientModal";
import ClientDetailsModal from "./ClientDetailModal";

const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

function ClientsData() {
  const { clients, setClients } = useClients();
  const { authToken, user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch clients from API
  const fetchClients = useCallback(async () => {
    if (!authToken || !user?.organization?.id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://app.webitservices.com/api/organizations/${user.organization.id}/clients`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // ✅ Prevent unnecessary state updates
      setClients((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(response.data)) {
          console.log("✅ Updating clients state.");
          return response.data;
        }
        console.log("⚠️ No changes detected, skipping update.");
        return prev;
      });
    } catch (error) {
      console.error("❌ Error fetching clients:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [authToken, user?.organization?.id, setClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]); // ✅ Only runs when dependencies change

  // ✅ Handle opening the details modal
  const handleOpenDetailsModal = useCallback((client) => {
    if (!client || !client.id) {
      console.error("❌ ERROR: Selected client is missing an ID:", client);
      return;
    }
    console.log("🔹 Opening details for:", client);
    setSelectedClient(client);
    setDetailsModalOpen(true);
  }, []);

  // ✅ Prevent duplicate client additions
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

      setClients((prevClients) => {
        if (prevClients.some((c) => c.id === clientData.id)) {
          return prevClients; // Prevent duplicate client entry
        }
        return [...prevClients, clientData];
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error adding client:", error.response?.data || error.message);
    }
  };

  // ✅ Memoized client filtering to prevent unnecessary recalculations
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // ✅ Memoized table rows to improve performance
  const tableRows = useMemo(() => {
    return filteredClients.map((client) => ({
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
    }));
  }, [filteredClients, handleOpenDetailsModal]);

  return (
    <MDBox p={3}>
      <TextField
        fullWidth
        placeholder="Search Clients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <DataTable
        table={{
          columns: clientColumns,
          rows: tableRows,
        }}
        isLoading={loading}
        entriesPerPage={{ defaultValue: 10, options: [10, 25, 50, 100] }}
        showTotalEntries
      />

      {/* ✅ Modals */}
      {isModalOpen && <AddClientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} />}
      {detailsModalOpen && selectedClient && (
        <ClientDetailsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} client={selectedClient} />
      )}
    </MDBox>
  );
}

export default ClientsData;
