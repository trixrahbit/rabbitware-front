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

  // Fetch organizations
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

  useEffect(() => {
    fetchOrganizations();
  }, [authToken]);

  // Handle adding a new organization
  const handleSaveOrg = async (orgData) => {
    try {
      await axios.post(`https://app.webitservices.com/api/organizations`, orgData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchOrganizations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error saving organization:", error.response?.data || error.message);
    }
  };

  // Filter organizations based on search
  const filteredOrganizations = useMemo(
    () => organizations.filter((org) => org.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [organizations, searchQuery]
  );

  return (
    <MDBox p={3}>
      {/* ✅ Organizations Data Table */}
      <DataTable
        table={{
          columns: orgColumns,
          rows: filteredOrganizations.map((org) => ({
            ...org,
            name: (
              <MDTypography
                variant="button"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "none" }}
                onClick={() => {
                  setSelectedOrg(org);
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
        customHeader={(
          <MDBox display="flex" justifyContent="space-between" alignItems="center" width="100%">
            {/* ✅ Center: Search Bar & Filter */}
            <MDBox display="flex" alignItems="center" gap={2} justifyContent="center" flexGrow={1}>
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
              <MDButton variant="outlined" color="secondary" startIcon={<FilterListIcon />}>
                Filter
              </MDButton>
            </MDBox>


          </MDBox>
        )}
      />

      {/* ✅ Modals */}
      {isModalOpen && <AddOrgModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveOrg} />}
      {detailsModalOpen && selectedOrg && (
        <OrgDetailModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg}
        />
      )}
    </MDBox>
  );
};

export default OrganizationsData;
