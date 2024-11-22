import Analytics from "layouts/dashboards/analytics";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import NewUser from "layouts/pages/settings/users/new-user";
import Ticketing from "layouts/pages/service/tickets";
import Projects from "layouts/pages/projects";
import ProjectManagement from "layouts/pages/projects/projectmanagement";
import TemplateBuilder from "layouts/pages/projects/templatebuilder";
import ClientsData from "./layouts/pages/crm/clients";
import ApplicationUsersPage from "./layouts/pages/settings/users/app-user";
import AppRoles from "./layouts/pages/settings/roles/app-role";
import { useAuth } from 'context/AuthContext';

// Material Dashboard 2 PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "assets/images/team-3.jpg";
import Basic from "./layouts/authentication/sign-in/basic";
import React from "react";
import OrganizationsData from "./layouts/pages/crm/organizations";
import FormBuilder from "./layouts/pages/formbuilder";
import FormListPage from "./layouts/pages/formbuilder";
import IntegrationPage from "./layouts/pages/settings/integrations";
import DashboardLayout from "./layouts/pages/calendarbooking/CalendarDashboard";
import BookingLinkManager from "./layouts/pages/calendarbooking/BookingLinkManager";
import MeetingManagement from "./layouts/pages/calendarbooking/MeetingManagement";
import BookingPage from "./layouts/pages/calendarbooking/BookingPage";
import BrandingSettings from "./layouts/pages/calendarbooking/BrandingSettings";
import NotificationSettings from "./layouts/pages/calendarbooking/NotificationSettings";
import UserProfile from "./layouts/pages/calendarbooking/UserProfile";
import SubscriptionPage from "./layouts/pages/settings/subscriptions";

// Attempt to retrieve the user object from localStorage
const userString = localStorage.getItem('user');

// Parse the user object string back into an object, or use a fallback object if not found
const userObject = userString ? JSON.parse(userString) : null;

// Extract the user's name from the object, or use 'Guest' as a fallback
const userName = userObject ? userObject.name : 'Guest';


const routes = [

  {
    type: "collapse",
    name: "Dashboards",
    key: "dashboards",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    collapse: [
      {
        name: "Analytics",
        key: "analytics",
        route: "/dashboards/analytics",
        component: <Analytics />,
      },

    ],
  },
  { type: "title", title: "CRM", key: "crm" },
  {
    type: "collapse",
    name: "Clients",
    key: "pages",
    icon: <Icon fontSize="medium">image</Icon>,
    collapse: [
          {
            name: "Client Overview",
            key: "profile-overview",
            route: "/pages/crm/clients",
            component: <ClientsData />,
          },
      {
        name: "Organizations",
        key: "organizations",
        route: "/pages/crm/organizations",
        component:<OrganizationsData/>,
        },
    ],
  },
  { type: "divider", key: "divider-1" },
  { type: "title", title: "Sales", key: "sales" },
         {
    type: "collapse",
    name: "Sales",
    key: "saleslink",
    icon: <Icon fontSize="medium">upcoming</Icon>,
    collapse: [
      {
        name: "Sales Reps",
        key: "getting-started",
        collapse: [
          {
            name: "Territories",
            key: "overview",
            href: "https://www.creative-tim.com/learning-lab/react/overview/material-dashboard/",
          },
        ],
      },
    ],
  },
         {
    type: "collapse",
    name: "Sales Stuff",
    key: "sales-stuff",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
        name: "Sales",
        key: "alerts",
        href: "https://www.creative-tim.com/learning-lab/react/alerts/material-dashboard/",
      },
      {
        name: "Sales",
        key: "avatar",
        href: "https://www.creative-tim.com/learning-lab/react/avatar/material-dashboard/",
      },
    ],
  },
   { type: "divider", key: "divider-2" },
  { type: "title", title: "Service", key: "service" },
    {
    type: "collapse",
    name: "Tickets",
    key: "basic",
    icon: <Icon fontSize="medium">upcoming</Icon>,
    collapse: [
      {

            name: "Ticketing",
            key: "Ticketing",
            route: "/service/tickets",
            component: <Ticketing />,
            protected: true,

      },
    ],
  },

  {
    type: "collapse",
    name: "Projects",
    key: "projects",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
            name: "Projects",
            key: "Projects",
            route: "/projects",
            component: <Projects />,
            protected: true,
      },
      {
            name: "Project Management",
            key: "Project Management",
            route: "/projectmanagement",
            component: <ProjectManagement />,
            protected: true,
      },
      {
        name: "Template Builder",
        key: "template-builder",
        route: "/template-builder",
        component: <TemplateBuilder/>,
        protected: true,
      },

    ],
  },

  // { type: "divider", key: "divider-3" },
  // { type: "title", title: "Automations", key: "automations" },
  //         {
  //   type: "collapse",
  //   name: "Task Flows",
  //   key: "taskflows",
  //   icon: <Icon fontSize="medium">upcoming</Icon>,
  //   collapse: [
  //     {
  //       name: "Getting Started",
  //       key: "getting-started",
  //       collapse: [
  //         {
  //           name: "Overview",
  //           key: "overview",
  //           href: "https://www.creative-tim.com/learning-lab/react/overview/material-dashboard/",
  //         },
  //         {
  //           name: "License",
  //           key: "license",
  //           href: "https://www.creative-tim.com/learning-lab/react/license/material-dashboard/",
  //         },
  //         {
  //           name: "Quick Start",
  //           key: "quick-start",
  //           href: "https://www.creative-tim.com/learning-lab/react/quick-start/material-dashboard/",
  //         },
  //         {
  //           name: "Build Tools",
  //           key: "build-tools",
  //           href: "https://www.creative-tim.com/learning-lab/react/build-tools/material-dashboard/",
  //         },
  //       ],
  //     },
  //   ],
  // },

  { type: "divider", key: "divider-4" },
  { type: "title", title: "Operations", key: "Operations" },
  {
    type: "collapse",
    name: "Forms",
    key: "forms",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
            name: "Forms",
            key: "Forms",
            route: "/forms",
            component: <FormListPage/>,
            protected: true,
      },

    ],
  },

  {
    type: "collapse",
    name: "Analytics",
    key: "analytics",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
         {
        name: "Analytics",
        key: "alerts",
        href: "https://www.creative-tim.com/learning-lab/react/alerts/material-dashboard/",
      },
    ],
  },

      {
    type: "collapse",
    name: "Calendar Booking",
    key: "booking",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
            name: "Calendar Booking",
            key: "booking",
            route: "/calendarbooking",
            component: <DashboardLayout/>,
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
        },
        {
            name: "Calendar Profile",
            key: "calendar-profile",
            route: "/user-profile",
            component: <UserProfile />,
        }
         ],
  },


  { type: "divider", key: "divider-5" },







{ type: "title", title: "Settings", key: "settings-title" },

  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,

    collapse: [
          {
            name: "Users",
            key: "users",
            route: "/settings/users/app-user",
            component: <ApplicationUsersPage />,
          },
          {
            name: "Roles",
            key: "roles",
            route: "/settings/roles/app-role",
            component: <AppRoles />,
          },
          {
        name: "Security",
        key: "security",
        href: "/settings/security",
      },
                  {
            name: "Integrations",
            key: "integrations",
            route: "/settings/integrations",
            component: <IntegrationPage />,
          },
        {
            name: "Subscriptions",
            key: "subscriptions",
            route: "/settings/subscriptions",
            component: <SubscriptionPage />,
          },
    ],
  },

];

export default routes;
