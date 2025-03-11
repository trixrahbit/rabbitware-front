import React from "react";
import ClientsData from "layouts/pages/crm/clients";
import OrganizationsData from "layouts/pages/crm/organizations";
import Icon from "@mui/material/Icon";
import { useAuth } from "context/AuthContext"; // ✅ Import authentication context

const crmRoutes = () => {
  const { user } = useAuth(); // ✅ Get the logged-in user

  return [
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
        // ✅ Only show Organizations if the user's organization has super_admin = 1
        ...(user?.organization?.super_admin === 1
          ? [
              {
                name: "Organizations",
                key: "organizations",
                route: "/pages/crm/organizations",
                component: <OrganizationsData />,
                protected: true,
              },
            ]
          : []),
      ],
    },
  ];
};

export default crmRoutes;
