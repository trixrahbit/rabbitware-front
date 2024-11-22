import React from "react";
import { Link } from "react-router-dom";
import { Grid, Paper, Typography } from "@mui/material";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Sample data for forms
const forms = [
  { id: 1, name: "Registration Form", description: "Form to register users" },
  { id: 2, name: "Feedback Form", description: "Form to collect user feedback" },
  { id: 3, name: "Survey Form", description: "Form for surveys" },
];

const FormListPage = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} p={2} component={Paper}>
        <Typography variant="h4" mb={2}>
          All Forms
        </Typography>
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} md={4} key={form.id}>
              <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
                <Typography variant="h6">{form.name}</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  {form.description}
                </Typography>
                <MDButton variant="contained" color="primary" component={Link} to={`/formbuilder/${form.id}`}>
                  Edit Form
                </MDButton>
              </MDBox>
            </Grid>
          ))}
        </Grid>
        <MDBox mt={4} textAlign="center">
          <MDButton variant="contained" color="info" component={Link} to="/formbuilder">
            Create New Form
          </MDButton>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default FormListPage;
