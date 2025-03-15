import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { useAuth } from "context/AuthContext"; // Ensure correct import
import MDBox from "../../../../../../components/MDBox";
import MDButton from "../../../../../../components/MDButton";
import AddUserModal from "./AddUserModal"; // Adjust import path if needed
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditUserModal from "./EditUserModal";

const ApplicationUsersData = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authToken, user } = useAuth(); // ✅ Use `user` directly, as it contains `organization_id`
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ✅ Fetch users based on the user's organization ID
  const fetchUsers = async () => {
    const orgId = user?.organization_id; // ✅ Use user’s org ID instead of `currentOrg`

    if (!orgId) {
      console.warn("⚠️ No Organization ID found. Skipping user fetch.");
      return;
    }

    const url = `https://app.webitservices.com/api/organizations/${orgId}/users`;

    try {
      console.log(`🔍 Fetching users for Org ID: ${orgId}...`);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ Users fetched:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  // ✅ Fetch users when `user.organization_id` or `authToken` changes
  useEffect(() => {
    if (user?.organization_id) {
      fetchUsers();
    }
  }, [user?.organization_id, authToken]);

  // ✅ Open & close modals
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // ✅ Add User
  const handleSaveUser = async (userData) => {
    const orgId = user?.organization_id;
    if (!orgId) {
      console.error("❌ Organization ID is missing. Cannot add user.");
      return;
    }

    try {
      await axios.post(`https://app.webitservices.com/api/organizations/${orgId}/users`, userData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ User added successfully.");
      fetchUsers(); // Refresh user list
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error adding user:", error);
    }
  };

  // ✅ Delete User
  const handleDeleteUser = async (userId) => {
    const orgId = user?.organization_id;
    if (!orgId) {
      console.error("❌ Organization ID is missing. Cannot delete user.");
      return;
    }

    try {
      await axios.delete(`https://app.webitservices.com/api/organizations/${orgId}/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ User deleted successfully.");
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };

  // ✅ Open edit modal
  const handleEditUser = (user) => {
    console.log("✏️ Editing user:", user);
    setEditingUser(user);
    setEditModalOpen(true);
  };

  // ✅ Save edited user
  const handleSaveEditedUser = async (userId, userData) => {
    const orgId = user?.organization_id;
    if (!orgId) {
      console.error("❌ Organization ID is missing. Cannot update user.");
      return;
    }

    try {
      await axios.put(`https://app.webitservices.com/api/organizations/${orgId}/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ User updated successfully.");
      fetchUsers(); // Refresh user list
      setEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("❌ Error updating user:", error);
    }
  };

  // ✅ Define table columns
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
      accessor: (user) => (
        <div>
          <IconButton onClick={() => handleEditUser(user)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(user.id)}>
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
