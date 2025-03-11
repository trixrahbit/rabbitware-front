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
import {useClients} from "../../../../../context/ClientsContext";

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
  const { clients, setClients } = useClients(); // ✅ Ensure useClients is imported properly

  // Fetch organizations
const fetchOrganizations = async () => {
  try {
    const response = await axios.get("https://app.webitservices.com/api/organizations", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setOrganizations(response.data);
  // Now properly sets organizations
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
};


useEffect(() => {
  if (authToken) {
    fetchOrganizations();
  }
}, [authToken]);


const handleSaveOrg = async (orgData) => {
  try {
    const response = await axios.post(
      `https://app.webitservices.com/api/organizations`, // ✅ Fixed API URL
      orgData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log("✅ Organization saved:", response.data);
    fetchOrganizations(); // ✅ Refresh list
    setIsModalOpen(false);
  } catch (error) {
    console.error("❌ Error saving organization:", error.response?.data || error.message);
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
