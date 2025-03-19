import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography } from "@mui/material";
import { useContacts } from "./contactsData";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

const ContactsTable = ({ clientId }) => {
  const { contacts, isLoading, error } = useContacts(clientId);

  if (isLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" py={3}>
        <CircularProgress color="success" />
      </MDBox>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" py={2}>
        ❌ Error loading contacts.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden" }}>
      <Table>
        {/* ✅ Table Header */}
        <TableHead sx={{ backgroundColor: "#3BB273" }}> {/* Green header matching color scheme */}
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>First Name</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Last Name</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Role</TableCell>
          </TableRow>
        </TableHead>

        {/* ✅ Table Body */}
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow key={contact.id} hover>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#2E7D32" }}>
                  {contact.first_name}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "14px", color: "#2E7D32" }}>
                  {contact.last_name}
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
              <TableCell colSpan={5} align="center">
                <MDTypography variant="h6" color="textSecondary">
                  No contacts available.
                </MDTypography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContactsTable;
