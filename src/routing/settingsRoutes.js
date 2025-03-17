import ApplicationUsersPage from "layouts/pages/settings/users/app-user";
import AppRoles from "layouts/pages/settings/roles/app-role";
import IntegrationPage from "layouts/pages/settings/integrations";
import SubscriptionPage from "layouts/pages/settings/subscriptions";
import UserProfile from "layouts/pages/profile/profile-overview"; // ✅ Import the new Profile Page
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
        name: "Profile", // ✅ Added Profile
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
];

export default settingsRoutes;
