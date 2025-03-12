import FormBuilder from "layouts/pages/formbuilder/components/FormBuilder";
import FormListPage from "layouts/pages/formbuilder";
import Icon from "@mui/material/Icon";
import AnalyticsIndex from "layouts/pages/analytics"; // ✅ Import AnalyticsIndex
import OnCallIndex from "layouts/pages/oncall"; // ✅ Import On-Call Index Page

const operationsRoutes = [
  {
    type: "title",
    title: "Operations",
    key: "operations",
  },
  {
    type: "collapse",
    name: "Forms",
    key: "forms",
    icon: <Icon fontSize="medium">assignment</Icon>,
    collapse: [
      {
        name: "Forms",
        key: "forms-overview",
        route: "/forms",
        component: <FormListPage />,
        protected: true,
      },
      {
        name: "Form Builder",
        key: "form-builder",
        route: "/formbuilder",
        component: <FormBuilder />,
        protected: true,
      },
      {
        name: "Form Builder Detail",
        key: "formbuilder-detail",
        route: "/formbuilder/:id",
        component: <FormBuilder />,
        protected: true,
        hidden: true,
      },
    ],
  },
  {
    type: "collapse",
    name: "Analytics",
    key: "analytics",
    icon: <Icon fontSize="medium">analytics</Icon>,
    collapse: [
      {
        name: "Analytics",
        key: "analytics-overview",
        route: "/analytics",
        component: <AnalyticsIndex />,
        protected: true,
      },
    ],
  },
  {
    type: "collapse",
    name: "On-Call",
    key: "on-call",
    icon: <Icon fontSize="medium">phone_in_talk</Icon>, // ✅ Added On-Call Icon
    collapse: [
      {
        name: "On-Call",
        key: "on-call-overview",
        route: "/on-call",
        component: <OnCallIndex />, // ✅ Added On-Call Index Component
        protected: true,
      },
    ],
  },
];

export default operationsRoutes;
