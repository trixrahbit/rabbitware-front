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
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "context/AuthContext";
import Basic from "./layouts/authentication/sign-in/basic";
import FormListPage from "./layouts/pages/formbuilder";
import pageRoutes from "page.routes";
import useFilteredRoutes from "./routes"; // Ensure this is an array

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { authToken, authOverride, isLoading } = useAuth();
  const isAuthenticated = !!authToken;
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // ✅ Correctly get filtered routes by calling the function
  const routes = useFilteredRoutes();

  // 🔥 Show a loading screen while auth is being checked
  if (isLoading) {
    return <div>Loading...</div>;
  }

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
  {/* ✅ Show a Loading Screen Until Auth is Ready */}
  {isLoading ? (
    <Route path="*" element={<div>Loading...</div>} />
  ) : (
    <>
      {/* ✅ Render Routes Dynamically */}
      {Array.isArray(routes) && getRoutes(routes)}
      {Array.isArray(pageRoutes) && getRoutes(pageRoutes)}

      {/* ✅ Public Login Route */}
      <Route path="/login" element={<Basic />} />

      {/* ✅ Default Route - Redirect to Dashboard if Authenticated, Else Login */}
      <Route path="/" element={isAuthenticated || authOverride ? <Navigate to="/dashboards/analytics" replace /> : <Navigate to="/login" replace />} />

      {/* ✅ Catch-All Route */}
      <Route path="*" element={<Navigate to={isAuthenticated || authOverride ? "/dashboards/analytics" : "/login"} replace />} />
    </>
  )}
</Routes>

      </ThemeProvider>
    </AuthProvider>
  );
}
