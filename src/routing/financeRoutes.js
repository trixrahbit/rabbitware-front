import React from "react";
import Icon from "@mui/material/Icon";
import ContractsPage from "layouts/pages/crm/contracts";
import ServicesPage from "layouts/pages/crm/servbun/services"; // New: page for contract services
import ServiceBundlesPage from "layouts/pages/crm/servbun/serviceBundles"; // New: page for service bundles
// import MilestoneBillingStatusPage from "layouts/pages/finance/milestoneBillingStatus"; // New: page for milestone billing statuses
// import BillingCodesPage from "layouts/pages/finance/billingCodes"; // New: page for billing codes

const financeRoutes = [
  {
    type: "title",
    title: "Finance",
    key: "finance-menu",
  },
  {
    type: "collapse",
    name: "Finance",
    key: "finance",
    icon: <Icon fontSize="medium">account_balance</Icon>,
    collapse: [
      {
        name: "Contracts",
        key: "contracts",
        route: "/finance/contracts",
        component: <ContractsPage />,
        protected: true,
      },
      {
        name: "Services",
        key: "services",
        route: "/finance/services",
        component: <ServicesPage />,
        protected: true,
      },
      {
        name: "Service Bundles",
        key: "serviceBundles",
        route: "/finance/service-bundles",
        component: <ServiceBundlesPage />,
        protected: true,
      },
      // {
      //   name: "Milestone Billing Status",
      //   key: "milestoneBillingStatus",
      //   route: "/finance/milestone-billing-status",
      //   component: <MilestoneBillingStatusPage />,
      //   protected: true,
      // },
      // {
      //   name: "Billing Codes",
      //   key: "billingCodes",
      //   route: "/finance/billing-codes",
      //   component: <BillingCodesPage />,
      //   protected: true,
      // },
      // Additional finance-related routes can be added here.
    ],
  },
];

export default financeRoutes;
