import crmRoutes from "./routing/crmRoutes";
import serviceRoutes from "./routing/serviceRoutes";
import projectRoutes from "./routing/projectRoutes";
import operationsRoutes from "./routing/operationsRoutes";
import calendarRoutes from "./routing/calendarRoutes";
import settingsRoutes from "./routing/settingsRoutes";

const routes = [
  ...crmRoutes,
  ...serviceRoutes,
  ...projectRoutes,
  ...operationsRoutes,
  ...calendarRoutes,
  ...settingsRoutes,
];

export default routes;
