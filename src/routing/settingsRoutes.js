import ApplicationUsersPage from "layouts/pages/settings/users/app-user";
import AppRoles from "layouts/pages/settings/roles/app-role";
import IntegrationPage from "layouts/pages/settings/integrations";
import SubscriptionPage from "layouts/pages/settings/subscriptions";
import UserProfile from "layouts/pages/profile/profile-overview"; // New Profile Page
// New components for contracts and SLAs
import ContractsPage from "layouts/pages/crm/contracts";
import SLAPage from "layouts/pages/settings/admin/service/sla";
import Icon from "@mui/material/Icon";

const settingsRoutes = [
  {
    type: "title",
    title: "Settings",
    key: "settings-menu",
  },
  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: <Icon fontSize="medium">settings</Icon>,
    collapse: [
      {
        name: "Profile",
        key: "profile",
        route: "/profile/profile-overview",
        component: <UserProfile />,
        protected: true,
      },
      {
        name: "Users",
        key: "users",
        route: "/settings/users/app-user",
        component: <ApplicationUsersPage />,
        protected: true,
      },
      {
        name: "Roles",
        key: "roles",
        route: "/settings/roles/app-role",
        component: <AppRoles />,
        protected: true,
      },
      {
        name: "Integrations",
        key: "integrations",
        route: "/integrations",
        component: <IntegrationPage />,
        protected: true,
      },
      {
        name: "Subscriptions",
        key: "subscriptions",
        route: "/settings/subscriptions",
        component: <SubscriptionPage />,
        protected: true,
      },
    ],
  },
  {
    type: "collapse",
    name: "Admin",
    key: "admin",
    icon: <Icon fontSize="medium">admin_panel_settings</Icon>,
    collapse: [
      {
        name: "Service Desk",
        key: "service-desk",
        collapse: [
          {
            name: "SLAs",
            key: "slas",
            route: "/admin/service-desk/slas",
            component: <SLAPage />,
            protected: true,
          },
          // You can add other service desk related routes here
        ],
      },
      {
        name: "CRM",
        key: "crm",
        collapse: [
          {
            name: "Contracts",
            key: "contracts",
            route: "/admin/crm/contracts",
            component: <ContractsPage />,
            protected: true,
          },
          // You can add other CRM related routes here
        ],
      },
    ],
  },
];

export default settingsRoutes;
