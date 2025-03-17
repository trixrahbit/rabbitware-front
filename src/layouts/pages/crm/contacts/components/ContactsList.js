import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import MDButton from "components/MDButton";
import AddIcon from "@mui/icons-material/Add";
import NewContactModal from "./NewContactModal";
import { useAuth } from "context/AuthContext";

const ContactsList = ({ clientId }) => {
  const { authToken, user } = useAuth();
  const orgId = user?.organization_id;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  // ✅ Fetch contacts from API
  const fetchContacts = async () => {
    if (!clientId || !orgId || !authToken) {
      console.error("❌ Missing orgId or clientId");
      return;
    }

    setLoading(true);
    try {
      console.log(`📡 Fetching contacts for orgId: ${orgId}, clientId: ${clientId}`);

      const response = await axios.get(
        `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientId}/contacts`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setContacts(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching contacts:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, [clientId, orgId, authToken]);

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", padding: 2 }}>
      <MDButton
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setNewContactModalOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Contact
      </MDButton>

      {/* ✅ FIX BLURRY TABLE + ALIGNMENT ISSUES */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflowX: "auto" }}>
        <Table sx={{ minWidth: 700, borderCollapse: "collapse" }}>
          {/* ✅ PROPER HEADER STYLING */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", textAlign: "left", width: "25%" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "left", width: "30%" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "left", width: "20%" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "left", width: "25%" }}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <TableRow
                  key={contact.id || index}
                  sx={{
                    "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <TableCell>{`${contact.first_name} ${contact.last_name}`}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone || "N/A"}</TableCell>
                  <TableCell>{contact.role || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">No contacts found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Ensure table updates when a new contact is added */}
      <NewContactModal
        open={newContactModalOpen}
        onClose={() => {
          setNewContactModalOpen(false);
          fetchContacts(); // Refresh table on close
        }}
        clientId={clientId}
        orgId={orgId}
      />
    </Box>
  );
};

export default ContactsList;
