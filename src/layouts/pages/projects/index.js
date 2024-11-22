import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import ProjectData from "./components/ProjectData";
import Calendar from "../../applications/project_calendar";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import defaultLineChartData from "layouts/pages/charts/data/defaultLineChartData";
import gradientLineChartData from "layouts/pages/charts/data/gradientLineChartData";
import verticalBarChartData from "layouts/pages/charts/data/verticalBarChartData";
import horizontalBarChartData from "layouts/pages/charts/data/horizontalBarChartData";

const chartHeight = "10rem"; // Adjust the height to make widgets smaller

const Projects = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium" mb={2}>
          Projects
        </MDTypography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DefaultLineChart
                  icon={{ component: "insights" }}
                  title="Project Progress"
                  height={chartHeight}
                  description="Line chart showing project progress"
                  chart={defaultLineChartData}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <GradientLineChart
                  icon={{ component: "show_chart" }}
                  title="Task Completion"
                  height={chartHeight}
                  description="Line chart with gradient showing task completion"
                  chart={gradientLineChartData}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <VerticalBarChart
                  icon={{ color: "dark", component: "leaderboard" }}
                  title="Team Performance"
                  height={chartHeight}
                  description="Bar chart showing team performance"
                  chart={verticalBarChartData}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <HorizontalBarChart
                  icon={{ color: "dark", component: "splitscreen" }}
                  title="Resource Allocation"
                  height={chartHeight}
                  description="Horizontal bar chart showing resource allocation"
                  chart={horizontalBarChartData}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Calendar />
          </Grid>
          <Grid item xs={12}>
            <MDBox mt={2}>
              <ProjectData />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default Projects;
