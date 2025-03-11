import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import useFilteredRoutes from "routing/useFilteredRoutes"; // ✅ Import correct route hook
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "context/AuthContext";
import Basic from "./layouts/authentication/sign-in/basic";
import FormListPage from "./layouts/pages/formbuilder";
import pageRoutes from "page.routes"; // Ensure this is an array

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { authToken, authOverride } = useAuth();
  const isAuthenticated = !!authToken;
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // ✅ Correctly get filtered routes by calling the function
  const routes = useFilteredRoutes();

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

  // ✅ Ensure `allRoutes` is always an array before mapping
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
                <ProtectedRoute>
                  {route.component}
                </ProtectedRoute>
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
    <AuthProvider>
      <ThemeProvider theme={controller.darkMode ? themeDark : theme}>
        <CssBaseline />
        {controller.layout === "dashboard" && (
          <>
            <Sidenav
              color={controller.sidenavColor}
              brandName="RabbitAI"
              routes={routes}
            />
            <Configurator />
          </>
        )}
        <Routes>
          {getRoutes(Array.isArray(routes) ? routes : [])}
          {getRoutes(Array.isArray(pageRoutes) ? pageRoutes : [])}
          <Route path="/login" element={<Basic />} />
          <Route path="/" element={isAuthenticated || authOverride ? <FormListPage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated || authOverride ? "/dashboards/analytics" : "/login"} replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
