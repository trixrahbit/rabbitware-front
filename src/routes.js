import { useAuth } from "context/AuthContext";
import crmRoutes from "routing/crmRoutes";
import serviceRoutes from "routing/serviceRoutes";
import projectRoutes from "routing/projectRoutes";
import operationsRoutes from "routing/operationsRoutes";
import calendarRoutes from "routing/calendarRoutes";
import settingsRoutes from "routing/settingsRoutes";

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
