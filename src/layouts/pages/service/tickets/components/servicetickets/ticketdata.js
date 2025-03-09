import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import TicketDetailsModal from "./TicketDetailsModal"; // Import modal component

// Define table columns
const ticketColumns = [
  { Header: "ID", accessor: "id", width: "10%" },
  { Header: "Title", accessor: "title", width: "20%" },
  { Header: "Status", accessor: "status", width: "15%" },
  { Header: "Priority", accessor: "priority", width: "15%" },
  { Header: "Impact", accessor: "impact", width: "15%" },
  { Header: "Description", accessor: "description", width: "25%" },
];

const TicketData = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/tickets")
      .then((response) => {
        console.log("Tickets API Response:", response.data);
        // Ensure correct structure for DataTable
        const formattedTickets = response.data.map((ticket) => ({
          id: ticket.id || "N/A",
          title: ticket.title || "No Title",
          status: ticket.status || "Unknown",
          priority: ticket.priority || "Unassigned",
          impact: ticket.impact || "Unspecified",
          description: ticket.description || "No Description Available",
        }));
        setTickets(formattedTickets);
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, []);

  // Handle ticket click
  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  return (
    <>
      {/* Data Table */}
      <DataTable
        table={{
          columns: ticketColumns,
          rows: tickets.map((ticket) => ({
            ...ticket,
            onClick: () => handleRowClick(ticket), // Add click event to each row
          })),
        }}
      />

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default TicketData;
