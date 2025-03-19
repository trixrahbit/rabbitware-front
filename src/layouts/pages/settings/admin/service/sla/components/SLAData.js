import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import { Box, Checkbox, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SLADetails from "./SLADetails";

const slaColumns = [
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
    Header: "Name",
    accessor: "name",
    width: "25%",
    Cell: ({ row }) => (
      <MDTypography
        variant="button"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: "pointer" }}
        onClick={() => row.original.openDetails()}
      >
        {row.original.name || "No Name"}
      </MDTypography>
    ),
  },
  { Header: "Response Time", accessor: "response_time", width: "20%" },
  { Header: "Resolution Time", accessor: "resolution_time", width: "20%" },
  { Header: "Description", accessor: "description", width: "20%" },
];

const SLAData = ({ selectedFilter }) => {
  const [slas, setSlas] = useState([]);
  const [selectedSLAs, setSelectedSLAs] = useState([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSLA, setSelectedSLA] = useState(null);

  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/slas")
      .then((response) => {
        const formattedSLAs = response.data.map((sla) => ({
          ...sla,
          selected: false,
          openDetails: () => {
            setSelectedSLA(sla);
            setDetailsModalOpen(true);
          },
          toggleSelect: () => toggleSelection(sla.id),
        }));
        setSlas(formattedSLAs);
      })
      .catch((error) => console.error("Error fetching SLAs:", error));
  }, [selectedFilter]);

  const toggleSelection = (slaId) => {
    setSlas((prevSlas) =>
      prevSlas.map((sla) =>
        sla.id === slaId ? { ...sla, selected: !sla.selected } : sla
      )
    );
    setSelectedSLAs((prev) =>
      prev.includes(slaId) ? prev.filter((id) => id !== slaId) : [...prev, slaId]
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Action bar for selected SLAs */}
        {selectedSLAs.length > 0 && (
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
      <DataTable table={{ columns: slaColumns, rows: slas }} />
      {detailsModalOpen && selectedSLA && (
        <SLADetails
          open={detailsModalOpen}
          sla={selectedSLA}
          onClose={() => setDetailsModalOpen(false)}
          // Optionally provide onSLAUpdated and onSLADeleted callbacks to refresh the list
        />
      )}
    </Box>
  );
};

export default SLAData;
