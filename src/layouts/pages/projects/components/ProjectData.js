import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconButton, Tooltip, Icon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "examples/Tables/DataTable"; // Adjust the import path as necessary
import MDBox from "components/MDBox";
import MDButton from "components/MDButton"; // Ensure you have this import
import AddProjectModal from "./AddProjectModal"; // Adjust the import path as needed

const ProjectData = ({ onEdit, onDelete }) => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await axios.get("https://app.webitservices.com/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      await axios.post("https://app.webitservices.com/api/projects", projectData);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <MDBox>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDBox pl={1}>

        </MDBox>
      </MDBox>
      <DataTable
        table={{
          columns: [
            {
              Header: "Name",
              accessor: "name",
              Cell: ({ row }) => (
                <MDButton onClick={() => handleProjectClick(row.original.id)}>
                  {row.original.name}
                </MDButton>
              ),
            },
            { Header: "Description", accessor: "description" },
            { Header: "Client", accessor: "client.name" },
            {
              Header: "Actions",
              accessor: "actions",
              Cell: ({ row }) => (
                <MDBox display="flex" justifyContent="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleProjectClick(row.original.id)}>
                      <Icon>edit</Icon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => onDelete(row.original.id)}>
                      <Icon>delete</Icon>
                    </IconButton>
                  </Tooltip>
                </MDBox>
              ),
            },
          ],
          rows: projects.map((project) => ({
            ...project,
            client: project.client || {},
            actions: null,
          })),
        }}
      />
      <AddProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
    </MDBox>
  );
};

export default ProjectData;
