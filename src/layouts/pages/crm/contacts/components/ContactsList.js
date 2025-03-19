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
  CircularProgress,
} from "@mui/material";
import { useAuth } from "context/AuthContext";
import MDTypography from "components/MDTypography";

const ContactsList = ({ clientId }) => {
  const { authToken, user } = useAuth();
  const orgId = user?.organization_id;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchContacts = async () => {
      if (!clientId || !orgId || !authToken) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientId}/contacts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (isMounted && JSON.stringify(response.data) !== JSON.stringify(contacts)) {
          setContacts(response.data || []);
        }
      } catch (error) {
        console.error("❌ Error fetching contacts:", error.response?.data || error.message);
      }
      if (isMounted) setLoading(false);
    };

    fetchContacts();

    return () => {
      isMounted = false;
    };
  }, [clientId, orgId, authToken]);

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden" }}>
      <Table sx={{ width: "100%", tableLayout: "fixed" }}>
        {/* ✅ Table Header: Ensure it spans full width */}
        <TableHead sx={{ backgroundColor: "#3BB273", display: "table-header-group", width: "100%" }}>
          <TableRow sx={{ width: "100%" }}>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", width: "25%" }}>
              Name
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", width: "30%" }}>
              Email
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", width: "20%" }}>
              Phone
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", width: "25%" }}>
              Role
            </TableCell>
          </TableRow>
        </TableHead>

        {/* ✅ Table Body */}
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress color="success" />
              </TableCell>
            </TableRow>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow key={contact.id} hover>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#2E7D32" }}>
                  {contact.first_name} {contact.last_name}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#1E88E5" }}>
                  {contact.email}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#616161" }}>
                  {contact.phone || "N/A"}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#FF9800" }}>
                  {contact.role || "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <MDTypography variant="h6" color="textSecondary">
                  No contacts found.
                </MDTypography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContactsList;
