import { useAuth } from "context/AuthContext"; // ✅ Get Auth Context
import crmRoutes from "./routing/crmRoutes";
import serviceRoutes from "./routing/serviceRoutes";
import projectRoutes from "./routing/projectRoutes";
import operationsRoutes from "./routing/operationsRoutes";
import calendarRoutes from "./routing/calendarRoutes";
import settingsRoutes from "./routing/settingsRoutes";

const useFilteredRoutes = () => {
  const { user } = useAuth(); // ✅ Get logged-in user safely
  const isSuperAdmin = user?.organization?.super_admin === 1; // ✅ Check if the user's org is a super admin

  // ✅ Filter CRM routes (only show Organizations for Super Admin)
  const filteredCrmRoutes = crmRoutes.map((route) => {
    if (route.key === "clients") {
      return {
        ...route,
        collapse: route.collapse.filter(
          (subRoute) => subRoute.key !== "organizations" || isSuperAdmin
        ),
      };
    }
    return route;
  });

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
