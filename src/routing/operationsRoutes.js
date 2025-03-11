import FormBuilder from "layouts/pages/formbuilder/components/FormBuilder";
import FormListPage from "layouts/pages/formbuilder";
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
];

export default operationsRoutes;
