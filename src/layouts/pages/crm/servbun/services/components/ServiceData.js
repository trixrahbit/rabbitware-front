import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import { Box, Checkbox } from "@mui/material";
import { useAuth } from "context/AuthContext";

const serviceColumns = [
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
    Header: "Service Name",
    accessor: "service_name",
    width: "25%",
    Cell: ({ row }) => (
      <MDTypography
        variant="button"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: "pointer" }}
        onClick={() => row.original.onClick && row.original.onClick()}
      >
        {row.original.service_name || "N/A"}
      </MDTypography>
    ),
  },
  { Header: "Price", accessor: "price", width: "15%" },
  { Header: "Cost", accessor: "cost", width: "15%" },
];

const ServiceData = ({ onServiceClick }) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const { authToken } = useAuth();

  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/services", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        const formattedServices = response.data.map((service) => ({
          ...service,
          selected: false,
          onClick: () => onServiceClick && onServiceClick(service),
          toggleSelect: () => toggleSelection(service.id),
        }));
        setServices(formattedServices);
      })
      .catch((error) =>
        console.error("Error fetching services:", error.response?.data || error.message)
      );
  }, [onServiceClick, authToken]);

  const toggleSelection = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, selected: !s.selected } : s
      )
    );
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Box>
      <DataTable table={{ columns: serviceColumns, rows: services }} />
    </Box>
  );
};

export default ServiceData;
