import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import DataTable from "examples/Tables/DataTable"; // Make sure this path is correct

// Define your columns structure here
const ticketColumns = [
  { Header: "ID", accessor: "id", width: "10%" },
  { Header: "Title", accessor: "title", width: "45%" },
  { Header: "Description", accessor: "description", width: "45%" },
  // Add more columns as needed
];

const TicketData = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch your tickets from the backend
    axios.get('https://app.webitservices.com/api/tickets')
      .then(response => {
        // Assuming the response data is the array of ticket objects
        setTickets(response.data);
      })
      .catch(error => console.error('Error fetching tickets:', error));
  }, []);

  return (
    <DataTable
      table={{
        columns: ticketColumns,
        rows: tickets, // Assuming `tickets` is an array of objects formatted as expected by your columns
      }}
      // Add any additional props as needed
    />
  );
};

export default TicketData;



