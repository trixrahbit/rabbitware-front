import React, { useState } from "react";
import DataTable from "../../../../../examples/Tables/DataTable"; // Adjust import path as necessary
import { useAuth } from "../../../../../context/AuthContext"; // Adjust import path as necessary
import MDBox from "../../../../../components/MDBox";
import MDButton from "../../../../../components/MDButton";
import AddClientModal from "./AddClientModal"; // Assuming you have this component
import { Link } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClientDetailsModal from "./ClientDetailModal";
import { useClients } from "../../../../../context/ClientsContext"; // Adjust import path as necessary
import axios from "axios"; // Adjust import path as necessary

// Define columns for the clients table
const clientColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const ClientsData = () => {
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
    console.log('Closing modal');
    setDetailsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (clientData) => {
    const completeClientData = { ...clientData, creator_id: user?.id };
    try {
      await axios.post("https://app.webitservices.com/api/clients", completeClientData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Fetch clients again to update the state
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  return (
    <MDBox position="relative">
      <Tooltip title="Add Client" placement="right">
        <IconButton
          onClick={handleOpenModal}
          color="primary"
          sx={{
            position: 'absolute',
            right: 0,
            top: -45,
            backgroundColor: "info.main",
            '&:hover': { backgroundColor: "info.dark" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        table={{
          columns: clientColumns,
          rows: clients.map(client => ({
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
      {isModalOpen && (
        <AddClientModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveClient} />
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
};

export default ClientsData;
