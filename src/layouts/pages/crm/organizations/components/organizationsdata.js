import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { TextField, InputAdornment, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DataTable from "examples/Tables/DataTable";

import { useAuth } from "context/AuthContext";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import AddOrgModal from "./AddOrgModal";
import OrgDetailModal from "./OrgDetailModal";

const orgColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const OrganizationsData = () => {
  const { authToken } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // ✅ Fetch organizations function
  const fetchOrganizations = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const response = await axios.get("https://app.webitservices.com/api/organizations", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setOrganizations(response.data);
    } catch (error) {
      console.error("❌ Error fetching organizations:", error);
    }
    setLoading(false);
  };

  // ✅ Fetch organizations on initial load
  useEffect(() => {
    fetchOrganizations();
  }, [authToken]);

  // ✅ Refresh organizations list when the details modal closes
  const handleModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedOrg(null);
    fetchOrganizations(); // ✅ Refresh list after closing the modal
  };

  return (
    <MDBox p={3}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* ✅ Search Bar */}
        <TextField
          placeholder="Search Organizations"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "background.default" },
            maxWidth: "250px", // ✅ Properly sized
          }}
        />

        {/* ✅ Filter & Add Organization Buttons */}
        <MDBox display="flex" gap={1}>
          <MDButton variant="outlined" color="secondary" startIcon={<FilterListIcon />}>
            Filter
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Organization
          </MDButton>
        </MDBox>
      </MDBox>

      {/* ✅ Organizations Data Table */}
      <DataTable
        table={{
          columns: orgColumns,
          rows: organizations
            .filter((org) => org.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((org) => ({
              ...org,
              name: (
                <MDTypography
                  variant="button"
                  color="primary"
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                  onClick={() => {
                    setSelectedOrg({ ...org }); // ✅ Ensure latest org data before opening modal
                    setDetailsModalOpen(true);
                  }}
                >
                  {org.name}
                </MDTypography>
              ),
            })),
        }}
        isLoading={loading}
        entriesPerPage={{ defaultValue: 10, options: [10, 25, 50, 100] }}
        showTotalEntries
      />

      {/* ✅ Modals */}
      {isModalOpen && (
        <AddOrgModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchOrganizations} />
      )}
      {detailsModalOpen && selectedOrg && (
        <OrgDetailModal open={detailsModalOpen} onClose={handleModalClose} organization={selectedOrg} refreshOrganizations={fetchOrganizations} />
      )}
    </MDBox>
  );
};

export default OrganizationsData;
