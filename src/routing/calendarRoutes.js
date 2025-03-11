import DashboardLayout from "layouts/pages/calendarbooking/CalendarDashboard";
import BookingLinkManager from "layouts/pages/calendarbooking/BookingLinkManager";
import MeetingManagement from "layouts/pages/calendarbooking/MeetingManagement";
import CalendarBooking from "layouts/pages/booking/CalendarBooking";
import BrandingSettings from "layouts/pages/calendarbooking/BrandingSettings";
import NotificationSettings from "layouts/pages/calendarbooking/NotificationSettings";
import UserProfile from "layouts/pages/calendarbooking/UserProfile";
import Icon from "@mui/material/Icon";

const calendarRoutes = [
  {
    type: "collapse",
    name: "Calendar Booking",
    key: "booking",
    icon: <Icon fontSize="medium">calendar_today</Icon>,
    collapse: [
      {
        name: "Booking",
        key: "booking-detail",
        route: "/booking/:uuid",
        component: <CalendarBooking />,
        protected: true,
        hidden: true,
      },
      {
        name: "Dashboard",
        key: "dashboard",
        route: "/calendarbooking",
        component: <DashboardLayout />,
        protected: true,
      },
      {
        name: "Meeting Management",
        key: "meeting-management",
        route: "/meeting-management",
        component: <MeetingManagement />,
        protected: true,
      },
      {
        name: "Branding Settings",
        key: "branding-settings",
        route: "/branding-settings",
        component: <BrandingSettings />,
        protected: true,
      },
      {
        name: "Notification Settings",
        key: "notification-settings",
        route: "/notification-settings",
        component: <NotificationSettings />,
        protected: true,
      },
      {
        name: "User Profile",
        key: "user-profile",
        route: "/user-profile",
        component: <UserProfile />,
        protected: true,
      },
    ],
  },
];

export default calendarRoutes;
