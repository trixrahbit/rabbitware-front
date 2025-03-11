import Projects from "layouts/pages/projects";
import ProjectEditor from "layouts/pages/projects/components/ProjectEditor";
import TemplateBuilder from "layouts/pages/projects/templatebuilder";
import DetailsPage from "layouts/pages/projects/projectmanagement/components/DetailsPage";
import Icon from "@mui/material/Icon";

const projectRoutes = [
  {
    type: "title",
    title: "Projects",
    key: "projects",
  },
  {
    type: "collapse",
    name: "Projects",
    key: "projects",
    icon: <Icon fontSize="medium">business</Icon>,
    collapse: [
      {
        name: "Projects",
        key: "projects",
        route: "/projects",
        component: <Projects />,
        protected: true,
      },
      {
        name: "Project Detail",
        key: "project-detail",
        route: "/projects/:projectId",
        component: <ProjectEditor />,
        protected: true,
        hidden: true,
      },
      {
        name: "Template Builder",
        key: "template-builder",
        route: "/template-builder",
        component: <TemplateBuilder />,
        protected: true,
      },
      {
        name: "Edit Item",
        key: "edit-item",
        route: "/edit/:itemType/:itemId",
        component: <DetailsPage />,
        protected: true,
        hidden: true,
      },
    ],
  },
];

export default projectRoutes;
