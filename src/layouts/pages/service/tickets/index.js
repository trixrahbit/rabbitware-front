import React, { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TicketData from "./components/servicetickets/ticketdata";
import TicketDetailsModal from "./components/servicetickets/TicketDetailsModal";

const Tickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="bold" color="textPrimary">
          Ticket Management
        </MDTypography>
        <MDBox mt={2}>
          <TicketData onTicketClick={handleTicketClick} />
        </MDBox>
      </MDBox>

      {modalOpen && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default Tickets;
