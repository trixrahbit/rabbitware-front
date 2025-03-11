import ClientsData from "layouts/pages/crm/clients";
import OrganizationsData from "layouts/pages/crm/organizations";
import Icon from "@mui/material/Icon";

const crmRoutes = [
  {
    type: "title",
    title: "CRM",
    key: "crm",
  },
  {
    type: "collapse",
    name: "Clients",
    key: "clients",
    icon: <Icon fontSize="medium">people</Icon>,
    collapse: [
      {
        name: "Client Overview",
        key: "client-overview",
        route: "/pages/crm/clients",
        component: <ClientsData />,
        protected: true,
      },
      {
        name: "Organizations",
        key: "organizations",
        route: "/pages/crm/organizations",
        component: <OrganizationsData />,
        protected: true,
        requiresSuperAdmin: true, // ✅ Add a custom key to filter later
      },
    ],
  },
];

export default crmRoutes;
