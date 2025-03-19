import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import { Box, Checkbox, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// Define table columns for Contracts
const contractColumns = [
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
    Header: "Contract Number",
    accessor: "contract_number",
    width: "20%",
    Cell: ({ row }) => (
      <MDTypography
        variant="button"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: "pointer" }}
        onClick={() => row.original.onClick()}
      >
        {row.original.contract_number || "N/A"}
      </MDTypography>
    ),
  },
  { Header: "Client ID", accessor: "client_id", width: "10%" },
  { Header: "Start Date", accessor: "start_date", width: "15%" },
  { Header: "End Date", accessor: "end_date", width: "15%" },
  { Header: "Details", accessor: "details", width: "25%" },
];

const ContractData = ({ onContractClick }) => {
  const [contracts, setContracts] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);

  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/contracts")
      .then((response) => {
        const formattedContracts = response.data.map((contract) => ({
          ...contract,
          selected: false,
          onClick: () => onContractClick(contract),
          toggleSelect: () => toggleSelection(contract.id),
        }));
        setContracts(formattedContracts);
      })
      .catch((error) => console.error("Error fetching contracts:", error));
  }, [onContractClick]);

  const toggleSelection = (contractId) => {
    setContracts((prevContracts) =>
      prevContracts.map((contract) =>
        contract.id === contractId
          ? { ...contract, selected: !contract.selected }
          : contract
      )
    );
    setSelectedContracts((prev) => {
      const isSelected = prev.includes(contractId);
      return isSelected
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId];
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {selectedContracts.length > 0 && (
          <Box>
            <Tooltip title="Delete Selected">
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Selected">
              <IconButton color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <DataTable table={{ columns: contractColumns, rows: contracts }} />
    </Box>
  );
};

export default ContractData;
