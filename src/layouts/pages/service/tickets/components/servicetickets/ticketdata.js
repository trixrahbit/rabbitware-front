import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";

const ticketColumns = [
  { Header: "ID", accessor: "id", width: "10%" },
  { Header: "Title", accessor: "title", width: "20%" },
  { Header: "Status", accessor: "status", width: "15%" },
  { Header: "Priority", accessor: "priority", width: "15%" },
  { Header: "Impact", accessor: "impact", width: "15%" },
  { Header: "Description", accessor: "description", width: "25%" },
];

const TicketData = ({ onTicketClick }) => {  // ✅ Accepts the prop
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    axios.get("https://app.webitservices.com/api/tickets")
      .then(response => {
        console.log("Tickets API Response:", response.data);
        setTickets(response.data);
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }, []);

  return (
    <DataTable
      table={{
        columns: ticketColumns,
        rows: tickets.map(ticket => ({
          ...ticket,
          onClick: () => onTicketClick(ticket),  // ✅ Attach click event
        })),
      }}
    />
  );
};

export default TicketData;
