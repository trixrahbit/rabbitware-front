import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable"; // Make sure this path is correct

// Define table columns with correct field names
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

  useEffect(() => {
    axios.get("https://app.webitservices.com/api/tickets")
      .then(response => {
        console.log("Tickets API Response:", response.data); // Debugging output
        // Ensure correct structure for the table
        const formattedTickets = response.data.map(ticket => ({
          id: ticket.id || "N/A",
          title: ticket.title || "No Title",
          status: ticket.status || "Unknown",
          priority: ticket.priority || "Unassigned",
          impact: ticket.impact || "Unspecified",
          description: ticket.description || "No Description Available",
        }));
        setTickets(formattedTickets);
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }, []);

  return (
    <DataTable
      table={{
        columns: ticketColumns,
        rows: tickets,
      }}
    />
  );
};

export default TicketData;
