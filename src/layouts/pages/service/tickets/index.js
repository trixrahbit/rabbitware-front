import React from "react";

// Material Dashboard 2 PRO React components and layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import TicketData from "./components/servicetickets/ticketdata"; // Adjust the import path as needed

const Tickets = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium">
          Tickets
        </MDTypography>
        <MDBox mt={2}>
          {/* TicketData component to display tickets */}
          <TicketData />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default Tickets;

