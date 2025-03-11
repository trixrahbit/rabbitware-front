import { useAuth } from "context/AuthContext";
import crmRoutes from "./crmRoutes";
import serviceRoutes from "./serviceRoutes";
import projectRoutes from "./projectRoutes";
import operationsRoutes from "./operationsRoutes";
import calendarRoutes from "./calendarRoutes";
import settingsRoutes from "./settingsRoutes";

const useFilteredRoutes = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.organization?.super_admin === 1;

  const filteredCrmRoutes = crmRoutes.filter(
    (route) => !route.requiresSuperAdmin || isSuperAdmin
  );

  return [
    ...filteredCrmRoutes,
    ...serviceRoutes,
    ...projectRoutes,
    ...operationsRoutes,
    ...calendarRoutes,
    ...settingsRoutes,
  ];
};

export default useFilteredRoutes;
