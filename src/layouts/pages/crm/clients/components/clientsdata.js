import React, { useState } from "react";
import DataTable from "../../../../../examples/Tables/DataTable";
import { useAuth } from "../../../../../context/AuthContext";
import MDBox from "../../../../../components/MDBox";
import MDButton from "../../../../../components/MDButton";
import MDTypography from "../../../../components/MDTypography";
import AddClientModal from "./AddClientModal";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClientDetailsModal from "./ClientDetailModal";
import { useClients } from "../../../../../context/ClientsContext";
import axios from "axios";

// Define columns for the clients table
const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const ClientsData = ({ searchQuery }) => {
  const { clients, setClients, fetchClients } = useClients();
  const { authToken, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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
    const completeClientData = { ...clientData, creator_id: user?.id };
    try {
      await axios.post("https://app.webitservices.com/api/clients", completeClientData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MDBox position="relative">
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDTypography variant="h5" fontWeight="bold">
          Client List
        </MDTypography>
        <Tooltip title="Add Client">
          <MDButton variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Add Client
          </MDButton>
        </Tooltip>
      </MDBox>
      <DataTable
        table={{
          columns: clientColumns,
          rows: filteredClients.map(client => ({
            ...client,
            name: (
              <button
                onClick={() => handleOpenDetailsModal(client)}
                style={{ textDecoration: 'none', border: 'none', background: 'none', padding: 0, color: 'blue', cursor: 'pointer' }}
              >
                {client.name}
              </button>
            ),
          })),
        }}
      />
      {isModalOpen && <AddClientModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveClient} />}
      {detailsModalOpen && selectedClient && <ClientDetailsModal open={detailsModalOpen} onClose={handleCloseDetailsModal} client={selectedClient} />}
    </MDBox>
  );
};

export default ClientsData;
