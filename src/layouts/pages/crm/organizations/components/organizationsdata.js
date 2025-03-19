import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { TextField, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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

  // ✅ Fetch organizations from API - Prevent infinite loops
  const fetchOrganizations = useCallback(async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const response = await axios.get("https://app.webitservices.com/api/organizations", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // ✅ Only update state if data actually changed
      setOrganizations((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(response.data)) {
          console.log("✅ Updating organizations state.");
          return response.data;
        }
        console.log("⚠️ No changes detected, skipping update.");
        return prev;
      });
    } catch (error) {
      console.error("❌ Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]); // ✅ Runs only when `authToken` changes

  // ✅ Debug: Log organization state changes
  useEffect(() => {
    if (organizations.length > 0) {
      console.log("📊 Updated organizations state:", organizations);
    }
  }, [organizations]);

  // ✅ Handle opening the details modal
  const handleOpenDetails = useCallback((org) => {
    if (!org || !org.id) {
      console.error("❌ ERROR: Selected organization is missing an ID:", org);
      return;
    }
    console.log("🔹 Opening details for:", org);
    setSelectedOrg(org);
    setDetailsModalOpen(true);
  }, []);

  // ✅ Filter organizations based on search query
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) =>
      org?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  // ✅ Ensure DataTable gets valid data
  const tableRows = useMemo(() => {
    return filteredOrganizations.map((org) => ({
      ...org,
      name: (
        <MDTypography
          variant="button"
          color="primary"
          sx={{ cursor: "pointer", textDecoration: "none" }}
          onClick={() => handleOpenDetails(org)}
        >
          {org.name}
        </MDTypography>
      ),
    }));
  }, [filteredOrganizations, handleOpenDetails]);

  return (
    <MDBox p={3}>
      <TextField
        fullWidth
        placeholder="Search Organizations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <DataTable
        table={{
          columns: orgColumns,
          rows: tableRows,
        }}
        isLoading={loading}
        entriesPerPage={{ defaultValue: 10, options: [10, 25, 50, 100] }}
        showTotalEntries
      />

      {/* ✅ Modals */}
      {isModalOpen && <AddOrgModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {detailsModalOpen && selectedOrg && (
        <OrgDetailModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg} // ✅ Correctly passing the selected organization
        />
      )}
    </MDBox>
  );
};

export default OrganizationsData;
