import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import { useMaterialUIController } from "context";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "context/AuthContext";
import Basic from "./layouts/authentication/sign-in/basic";
import Cover from "./layouts/authentication/sign-up/cover";
import FormListPage from "./layouts/pages/formbuilder";
import useFilteredRoutes from "./routes";
import LoadingScreen from "components/LoadingScreen";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { authToken, authOverride, setNavigate } = useAuth();
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routes = useFilteredRoutes();

  // ✅ Pass navigate function to AuthContext so it can be used inside `AuthProvider`
  useEffect(() => {
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate]);

  useMemo(() => {
    setRtlCache(createCache({ key: "rtl", stylisPlugins: [rtlPlugin] }));
  }, []);

  useEffect(() => {
    document.body.setAttribute("dir", controller.direction);
  }, [controller.direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) => {
    if (!Array.isArray(allRoutes)) {
      console.error("🚨 Expected an array of routes but got:", allRoutes);
      return null;
    }

    return allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            key={route.key}
            path={route.route}
            element={
              route.protected ? (
                <ProtectedRoute>{route.component}</ProtectedRoute>
              ) : (
                route.component
              )
            }
          />
        );
      }
      return null;
    });
  };

  return (
    <ThemeProvider theme={controller.darkMode ? themeDark : theme}>
      <CssBaseline />
      {controller.layout === "dashboard" && (
        <>
          <Sidenav color={controller.sidenavColor} brandName="Rabbit AI" routes={routes} />
          <Configurator />
        </>
      )}
      <Routes>
        {getRoutes(Array.isArray(routes) ? routes : [])}
        <Route path="/login" element={<Basic />} />
        <Route path="/authentication/sign-up/cover" element={<Cover />} />
        <Route path="/" element={authToken || authOverride ? <FormListPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={authToken || authOverride ? "/pages/crm/clients" : "/login"} replace />} />
      </Routes>
    </ThemeProvider>
  );
}
