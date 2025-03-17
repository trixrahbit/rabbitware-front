import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography } from "@mui/material";
import { useContacts } from "./components/contactsData"

const ContactsTable = ({ clientId }) => {
  const { contacts, isLoading, error } = useContacts(clientId);

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading contacts.</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>First Name</strong></TableCell>
            <TableCell><strong>Last Name</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Phone</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.first_name}</TableCell>
                <TableCell>{contact.last_name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone || "N/A"}</TableCell>
                <TableCell>{contact.role || "N/A"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No contacts available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContactsTable;
