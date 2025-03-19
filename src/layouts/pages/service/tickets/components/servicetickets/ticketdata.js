import React, { useState, useEffect } from "react";
import axios from "axios";
import { Checkbox, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MergeIcon from "@mui/icons-material/CallMerge";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

// Define table columns
const ticketColumns = [
  {
    Header: "",
    accessor: "select",
    width: "5%",
    Cell: ({ row }) => (
      <Checkbox
        checked={row.original.selected}
        onChange={() => row.original.toggleSelect()}
      />
    ),
  },
  { Header: "ID", accessor: "id", width: "10%" },
  {
    Header: "Title",
    accessor: "title",
    width: "25%",
    Cell: ({ row }) => (
      <MDTypography
        variant="button"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: "pointer" }}
        onClick={() => row.original.onClick()}
      >
        {row.original.title || "No Title"}
      </MDTypography>
    ),
  },
  { Header: "Status", accessor: "status", width: "15%" },
  { Header: "Priority", accessor: "priority", width: "15%" },
  { Header: "Impact", accessor: "impact", width: "15%" },
  { Header: "Description", accessor: "description", width: "20%" },
];

const TicketData = ({ onTicketClick, selectedQueue }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    let url = "https://app.webitservices.com/api/tickets";
    if (selectedQueue) {
      url += `?queue_id=${selectedQueue}`;
    }
    axios
      .get(url)
      .then((response) => {
        const formattedTickets = response.data.map((ticket) => ({
          ...ticket,
          selected: false,
          onClick: () => onTicketClick(ticket),
          toggleSelect: () => toggleSelection(ticket.id),
        }));
        setTickets(formattedTickets);
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, [onTicketClick, selectedQueue]);

  const toggleSelection = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, selected: !ticket.selected }
          : ticket
      )
    );
    setSelectedTickets((prev) => {
      const isSelected = prev.includes(ticketId);
      return isSelected ? prev.filter((id) => id !== ticketId) : [...prev, ticketId];
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {selectedTickets.length > 0 && (
          <Box>
            <Tooltip title="Delete Selected">
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Merge Selected">
              <IconButton color="primary">
                <MergeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <DataTable
        table={{
          columns: ticketColumns,
          rows: tickets,
        }}
      />
    </Box>
  );
};

export default TicketData;
