import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import TicketDetailsModal from "./TicketDetailsModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get("https://app.webitservices.com/api/tickets")
      .then(response => {
        console.log("Tickets API Response:", response.data);
        setTickets(response.data.map(ticket => ({
          id: ticket.id || "N/A",
          title: ticket.title || "No Title",
          status: ticket.status || "Unknown",
          priority: ticket.priority || "Unassigned",
          impact: ticket.impact || "Unspecified",
          description: ticket.description || "No Description Available",
          onClick: () => handleRowClick(ticket), // 🟢 Correctly passing onClick event
        })));
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }, []);

  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      <DataTable
        table={{
          columns: ticketColumns,
          rows: tickets,
        }}
      />

      {/* Ticket Details Modal */}
      <TicketDetailsModal ticket={selectedTicket} open={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default TicketData;
