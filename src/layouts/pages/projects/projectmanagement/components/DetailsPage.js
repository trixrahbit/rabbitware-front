import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";
import { Box, Typography, Card } from "@mui/material";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Custom components
import ChecklistSideNav from "../../../checklists/components/ChecklistSideNav";
import ChecklistData from "../../../checklists/components/ChecklistData";
import ChecklistCreator from "../../../checklists/components/ChecklistCreator";
import ProjectDetails from "./ProjectDetails";
import MDBox from "../../../../../components/MDBox";
import MDTypography from "../../../../../components/MDTypography";

const DetailsPage = () => {
  const { itemType, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [view, setView] = useState("details");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/${itemType}/${itemId}`);
        setItem(response.data);
      } catch (error) {
        console.error(`Error fetching ${itemType}:`, error);
      }
    };

    fetchItem();
  }, [itemType, itemId]);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8000/${itemType}/${itemId}`, item);
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      console.error(`Error updating ${itemType}:`, error);
    }
  };

  useEffect(() => {
    setView(location.hash === "#checklist" ? "checklist" : "details");
  }, [location.hash]);

  if (!item) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box pt={6} pb={3}>
          <Typography variant="h4">Loading...</Typography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={3}>
            <Box pt={3}>
              <ChecklistSideNav itemType={itemType} itemId={itemId} />
            </Box>
          </Grid>
          <Grid item xs={12} lg={9}>
            {view === "details" && (
              <ProjectDetails
                item={item}
                handleSave={handleSave}
                navigate={navigate}
                setItem={setItem}
                itemType={itemType}
              />
            )}
            {view === "checklist" && (
              <Card sx={{ overflow: "visible" }}>
                <MDBox p={3}>
                  <MDTypography variant="h5">Checklist</MDTypography>
                </MDBox>
                <MDBox pb={3} px={3}>
                  <ChecklistCreator />
                </MDBox>
                <MDBox pb={3} px={3}>
                  <ChecklistData
                    itemType={itemType}
                    itemId={itemId}
                    enableCheckbox={false}
                    enableDragDrop={true}
                    enableDelete={true}
                    inlineEdit={true}
                    enableChecklistNameEdit={true}  // Enabling name edit on the Details page
                  />
                </MDBox>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </DashboardLayout>
  );
};

export default DetailsPage;
