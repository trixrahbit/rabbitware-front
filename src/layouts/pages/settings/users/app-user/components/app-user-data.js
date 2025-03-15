import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { useAuth } from "context/AuthContext"; // ✅ Ensure import path is correct
import { useClients } from "context/ClientsContext"; // ✅ Import ClientsContext
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import AddUserModal from "./AddUserModal";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditUserModal from "./EditUserModal";

const ApplicationUsersData = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { authToken } = useAuth(); // ✅ Only use authToken from AuthContext
  const { clients } = useClients(); // ✅ Get `clients` from ClientsContext

  // ✅ Extract `organization_id` from the first client (if available)
  const organizationId = clients.length > 0 ? clients[0].organization_id : null;

  // ✅ Log organization_id to verify it's being retrieved
  useEffect(() => {
    console.log("🔍 Organization ID from ClientsContext:", organizationId);
  }, [organizationId]);

  // Fetch users based on the current organization
  const fetchUsers = async () => {
    if (!organizationId) {
      console.error("❌ Organization ID is missing, cannot fetch users.");
      return;
    }

    try {
      console.log(`📡 Fetching users for Org ID: ${organizationId}`);
      const response = await axios.get(
        `https://app.webitservices.com/api/organizations/${organizationId}/users`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ Users fetched:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [organizationId, authToken]); // ✅ Depend on `organizationId` from ClientsContext

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveUser = async (userData) => {
    if (!organizationId) {
      console.error("❌ Organization ID is missing, cannot add user.");
      return;
    }

    try {
      await axios.post(
        `https://app.webitservices.com/api/organizations/${organizationId}/users`,
        userData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ User added successfully");
      fetchUsers(); // ✅ Refresh users after adding a new one
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error adding user:", error.response?.data || error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!organizationId) {
      console.error("❌ Organization ID is missing, cannot delete user.");
      return;
    }

    try {
      await axios.delete(
        `https://app.webitservices.com/api/organizations/${organizationId}/users/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ User deleted successfully");
      fetchUsers(); // ✅ Refresh users after deletion
    } catch (error) {
      console.error("❌ Error deleting user:", error.response?.data || error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleSaveEditedUser = async (userId, userData) => {
    if (!organizationId) {
      console.error("❌ Organization ID is missing, cannot update user.");
      return;
    }

    try {
      await axios.put(
        `https://app.webitservices.com/api/organizations/${organizationId}/users/${userId}`,
        userData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ User updated successfully");
      fetchUsers();
      setEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("❌ Error updating user:", error.response?.data || error.message);
    }
  };

  const userColumns = [
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "Username", accessor: "username", width: "20%" },
    { Header: "Email", accessor: "email", width: "30%" },
    {
      Header: "Roles",
      accessor: (user) => user.roles.map((role) => role.name).join(", "),
      id: "roles",
      width: "30%",
    },
    {
      Header: "Actions",
      id: "actions",
      accessor: (originalRow) => (
        <div>
          <IconButton onClick={() => handleEditUser(originalRow)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(originalRow.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
      disableSortBy: true,
      width: "10%",
    },
  ];

  return (
    <MDBox position="relative">
      <MDBox display="flex" justifyContent="flex-end" mb={2}>
        <MDButton variant="contained" color="info" onClick={handleOpenModal}>
          Add New User
        </MDButton>
      </MDBox>
      <DataTable
        table={{
          columns: userColumns,
          rows: users,
        }}
      />
      {isModalOpen && (
        <AddUserModal open={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} />
      )}
      {editModalOpen && editingUser && (
        <EditUserModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={editingUser}
          onSave={handleSaveEditedUser}
        />
      )}
    </MDBox>
  );
};

export default ApplicationUsersData;
