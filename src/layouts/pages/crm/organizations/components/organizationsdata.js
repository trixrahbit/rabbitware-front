import React, { useState, useEffect, useMemo } from "react";
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

  // ✅ Fetch organizations from API
  const fetchOrganizations = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const response = await axios.get("https://app.webitservices.com/api/organizations", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ API Response:", response.data); // 🚀 Debugging

      if (!Array.isArray(response.data)) {
        throw new Error("API did not return an array.");
      }

      // ✅ Ensure each organization has a valid ID
      const sanitizedOrgs = response.data.filter((org) => org?.id);
      console.log("📊 Sanitized Organizations:", sanitizedOrgs);
      setOrganizations(sanitizedOrgs);
    } catch (error) {
      console.error("❌ Error fetching organizations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [authToken]);

  useEffect(() => {
    console.log("📊 Updated organizations state:", organizations); // Debug state changes
  }, [organizations]);

  // ✅ Handle opening the details modal
  const handleOpenDetails = (org) => {
    if (!org || !org.id) {
      console.error("❌ ERROR: Selected organization is missing an ID:", org);
      return;
    }
    console.log("🔹 Opening details for:", org);
    setSelectedOrg(org);
    setDetailsModalOpen(true);
  };

  // ✅ Filter organizations based on search
  const filteredOrganizations = useMemo(() => {
    if (!Array.isArray(organizations)) return [];
    return organizations.filter(
      (org) => org?.name && org.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  // ✅ Ensure DataTable gets valid data
  const tableRows = filteredOrganizations
    .map((org) => {
      if (!org.id) {
        console.warn("⚠️ Organization missing ID:", org); // Debugging
        return null; // Skip invalid entries
      }
      return {
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
      };
    })
    .filter(Boolean); // Remove null values

  console.log("📊 Final Table Rows:", tableRows); // Debug DataTable content

  return (
    <MDBox p={3}>
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
          refreshOrganizations={fetchOrganizations}
        />
      )}
    </MDBox>
  );
};

export default OrganizationsData;
