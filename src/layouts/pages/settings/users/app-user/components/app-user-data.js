import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { useAuth } from "context/AuthContext"; // Make sure this path is correct
import MDBox from "../../../../../../components/MDBox";
import MDButton from "../../../../../../components/MDButton";
import AddUserModal from "./AddUserModal"; // Adjust this import path as needed
import { IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditUserModal from "./EditUserModal";

const ApplicationUsersData = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authToken, currentOrg } = useAuth(); // Destructure authToken and currentOrg from context
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  // Fetch users based on the current organization
  const fetchUsers = async () => {
    const orgId = currentOrg?.id;
    console.log("orgId", orgId);
    if (!orgId) {
      console.error('Organization ID is not set, cannot fetch users.');
      return;
    }
    const url = `http://localhost:8000/organizations/${orgId}/users`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Use authToken for authorization
        },
      });
      setUsers(response.data); // Update state with fetched users
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Use effect to fetch users when currentOrg or authToken changes
  useEffect(() => {
    fetchUsers();
  }, [currentOrg, authToken]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveUser = async (userData) => {
    const orgId = currentOrg?.id; // Make sure you access orgId here as well
    if (!orgId) {
      console.error('Organization ID is not set, cannot add user.');
      return;
    }
    try {
      await axios.post(`http://localhost:8000/organizations/${orgId}/users`, userData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      fetchUsers(); // Refresh the list of users after adding a new one
      handleCloseModal(); // Close the modal upon success
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const orgId = currentOrg?.id; // Correctly access orgId within this function
    if (!orgId) {
      console.error('Organization ID is not set, cannot delete user.');
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/organizations/${orgId}/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("User deleted successfully");
      fetchUsers(); // Refresh the list of users after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

const handleEditUser = (user) => {
  setEditingUser(user);
  setEditModalOpen(true);
};

// Function to handle the saving of the edited user
const handleSaveEditedUser = async (userId, userData) => {
  try {
    await axios.put(`http://localhost:8000/organizations/${currentOrg?.id}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    fetchUsers(); // Refresh the list after editing
    setEditModalOpen(false); // Close the modal
    setEditingUser(null); // Reset the editing user
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

  const userColumns = [
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "Username", accessor: "username", width: "20%" },
    { Header: "Email", accessor: "email", width: "30%" },
    {
      Header: "Roles",
      accessor: user => user.roles.map(role => role.name).join(", "),
      id: "roles",
      width: "30%",
    },
    {
      Header: "Actions",
      id: "actions",
      accessor: (originalRow) => (
        <div>
          <IconButton onClick={() => handleEditUser(originalRow.id)}>
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
        <AddUserModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
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





