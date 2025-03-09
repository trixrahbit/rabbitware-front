import React, { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Button } from "@mui/material";
import { useClients } from "context/ClientsContext";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProjectData from "../components/ProjectData";
import AddProjectWizard from "./components/AddProjectWizard";


const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { clients } = useClients();

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`https://app.webitservices.com/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
      <DashboardLayout>
        <DashboardNavbar />
        <Grid container spacing={3} padding={3}>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={() => setIsWizardOpen(true)}>
              Add New Project
            </Button>
          </Grid>
          <Grid item xs={12}>
            <ProjectData projects={projects} />
          </Grid>
        </Grid>
        <Footer />
        <AddProjectWizard open={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      </DashboardLayout>
  );
};

export default ProjectManagement;
