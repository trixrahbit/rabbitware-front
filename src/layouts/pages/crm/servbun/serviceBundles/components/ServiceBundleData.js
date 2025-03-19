import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import { Box } from "@mui/material";

const bundleColumns = [
  { Header: "ID", accessor: "id", width: "10%" },
  {
    Header: "Bundle Name",
    accessor: "bundle_name",
    width: "25%",
    Cell: ({ row }) => (
      <MDTypography
        variant="button"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: "pointer" }}
        onClick={() => row.original.onClick && row.original.onClick()}
      >
        {row.original.bundle_name || "N/A"}
      </MDTypography>
    ),
  },
  { Header: "Price", accessor: "price", width: "15%" },
  { Header: "Cost", accessor: "cost", width: "15%" },
  {
    Header: "Services",
    accessor: "services",
    width: "35%",
    Cell: ({ row }) => {
      const services = row.original.services;
      const names =
        services && Array.isArray(services) && services.length > 0
          ? services.map((s) => s.service_name).join(", ")
          : "None";
      return <MDTypography variant="body2">{names}</MDTypography>;
    },
  },
];

const ServiceBundleData = ({ onBundleClick }) => {
  const [bundles, setBundles] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);

  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/service-bundles")
      .then((response) => {
        console.log("Fetched service bundles from backend:", response.data);
        const formattedBundles = response.data.map((bundle) => ({
          ...bundle,
          // Optional: if you need to support selection, you can add these:
          selected: false,
          onClick: () => onBundleClick && onBundleClick(bundle),
          toggleSelect: () => toggleSelection(bundle.id),
        }));
        setBundles(formattedBundles);
      })
      .catch((error) =>
        console.error("Error fetching service bundles:", error)
      );
  }, [onBundleClick]);

  const toggleSelection = (id) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
    setSelectedBundles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Box>
      <DataTable table={{ columns: bundleColumns, rows: bundles }} />
    </Box>
  );
};

export default ServiceBundleData;
