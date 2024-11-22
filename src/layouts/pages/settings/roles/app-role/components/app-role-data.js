import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "context/AuthContext"; // Adjust based on your actual path
import AddRoleModal from "./AddRoleModal"; // Adjust based on your actual path
import EditRoleModal from "./EditRoleModal"; // Make sure to create this component
import MDButton from "../../../../../../components/MDButton"; // Adjust the import path as necessary

const AppRolesData = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null); // State for the selected role to edit
  const { authToken, currentOrg } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control edit modal visibility

  useEffect(() => {
    const fetchRoles = async () => {
      const orgId = currentOrg?.id;
      if (!orgId) {
        console.log("Organization ID is not available, cannot fetch roles.");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/organizations/${orgId}/roles`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    if (currentOrg && authToken) {
      fetchRoles();
    }
  }, [currentOrg, authToken]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveRole = async (roleName) => {
    // Implementation remains the same as provided
  };

  const handleOpenEditModal = (role) => {
    setSelectedRole(role); // Set the role to be edited
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRole(null); // Clear the selected role after closing the modal
  };

  // Define columns for the roles table
  const roleColumns = [
    { Header: "Name", accessor: "name", width: "60%" },
    {
      Header: "Actions",
      id: "actions",
      accessor: (originalRow) => (
        <Box>
          <IconButton onClick={() => handleOpenEditModal(originalRow)}><EditIcon /></IconButton>
          <IconButton onClick={() => console.log(`Delete ${originalRow.name}`)}><DeleteIcon /></IconButton>
        </Box>
      ),
      disableSortBy: true,
    },
  ];

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <MDButton variant="contained" color="info" onClick={handleOpenModal}>
          Add New Role
        </MDButton>
      </Box>
      {isModalOpen && (
        <AddRoleModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRole}
        />
      )}
      {isEditModalOpen && selectedRole && (
        <EditRoleModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          role={selectedRole}
          onSave={() => console.log('Save function for editing needs to be implemented')} // Placeholder for your save function
        />
      )}
      <DataTable
        table={{
          columns: roleColumns,
          rows: roles,
        }}
      />
    </>
  );
};

export default AppRolesData;







