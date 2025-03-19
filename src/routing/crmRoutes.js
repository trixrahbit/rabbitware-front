import ClientsData from "layouts/pages/crm/clients";
import OrganizationsData from "layouts/pages/crm/organizations";
import ContactsData from "layouts/pages/crm/contacts"; // ✅ Import Contacts Page
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
        name: "Organizations",
        key: "organizations",
        route: "/pages/crm/organizations",
        component: <OrganizationsData />,
        protected: true,
        requiresSuperAdmin: true, // ✅ Restrict this route
      },
      {
        name: "Client Overview",
        key: "client-overview",
        route: "/pages/crm/clients",
        component: <ClientsData />,
        protected: true,
      },
      {
        name: "Contacts",
        key: "contacts",
        route: "/pages/crm/clients/:clientId/contacts", // ✅ Dynamic Route
        component: <ContactsData />,
        protected: true,
      },
    ],
  },
];

export default crmRoutes;
