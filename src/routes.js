import { useAuth } from "context/AuthContext"; // ✅ Get Auth Context
import crmRoutes from "./routing/crmRoutes";
import serviceRoutes from "./routing/serviceRoutes";
import projectRoutes from "./routing/projectRoutes";
import operationsRoutes from "./routing/operationsRoutes";
import calendarRoutes from "./routing/calendarRoutes";
import settingsRoutes from "./routing/settingsRoutes";

const useFilteredRoutes = () => {
  const { user } = useAuth(); // ✅ Get logged-in user
  const isSuperAdmin = user?.organization?.super_admin === 1; // ✅ Check if the user's org is a super admin

  // ✅ Filter out routes that require super_admin access if the user doesn’t have it
  const filteredCrmRoutes = crmRoutes.filter(
    (route) =>
      !route.requiresSuperAdmin || isSuperAdmin
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
