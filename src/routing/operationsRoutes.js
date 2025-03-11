import FormBuilder from "layouts/pages/formbuilder/components/FormBuilder";
import FormListPage from "layouts/pages/formbuilder";
import Analytics from "layouts/dashboards/analytics";
import Icon from "@mui/material/Icon";

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
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
        name: "Forms",
        key: "forms",
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
    icon: <Icon fontSize="medium">bar_chart</Icon>,
    collapse: [
      {
        name: "Analytics Dashboard",
        key: "analytics-dashboard",
        route: "/analytics",
        component: <Analytics />,
        protected: true,
      },
    ],
  },
];

export default operationsRoutes;
