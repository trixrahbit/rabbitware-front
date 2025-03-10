import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import { useAuth } from "context/AuthContext";
import MDBox from "components/MDBox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import AddOrgModal from "./AddOrgModal";
import OrgDetailModal from "./OrgDetailModal";

const orgColumns = [
  { Header: "Name", accessor: "name", width: "30%" },
  { Header: "Domain", accessor: "domain", width: "30%" },
  { Header: "Phone", accessor: "phone", width: "30%" },
];

const OrganizationsData = ({ onStatsFetched }) => {
  const [organizations, setOrganizations] = useState([]);
  const { authToken, organization } = useAuth(); // Fetch organization from context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch organizations
  const fetchOrganizations = async () => {
    if (!organization?.id) return; // Ensure org is available
    setLoading(true);
    console.log(`Fetching organizations for orgId: ${organization.id} with authToken: ${authToken}`);
    try {
      const response = await axios.get(
        `https://app.webitservices.com/api/organizations/${organization.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("Fetched organizations:", response.data);
      setOrganizations(response.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [authToken, organization]);

  const handleSaveOrg = async (orgData) => {
    if (!organization?.id) return;
    const dataToSend = { ...orgData, organization_id: organization.id };

    console.log("Saving organization data:", dataToSend);
    try {
      const response = await axios.post(
        `https://app.webitservices.com/api/organizations/${organization.id}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("Saved organization:", response.data);
      fetchOrganizations(); // Refresh list after saving
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving organization:", error);
    }
  };

  return (
    <MDBox pt={3}>
      {/* Add Organization Button */}
      <Tooltip title="Add Organization" placement="right">
        <IconButton
          onClick={() => setIsModalOpen(true)}
          color="primary"
          sx={{
            position: "absolute",
            right: "24px",
            top: "-50px",
            backgroundColor: "info.main",
            "&:hover": { backgroundColor: "info.dark" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Organizations Data Table */}
      <DataTable
        table={{
          columns: orgColumns,
          rows: organizations.map((org) => ({
            ...org,
            name: (
              <button
                onClick={() => {
                  setSelectedOrg(org);
                  setDetailsModalOpen(true);
                }}
                style={{
                  textDecoration: "none",
                  border: "none",
                  background: "none",
                  padding: 0,
                  color: "blue",
                  cursor: "pointer",
                }}
              >
                {org.name}
              </button>
            ),
          })),
        }}
        isLoading={loading}
      />

      {/* Modals */}
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
