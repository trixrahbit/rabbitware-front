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
import routes from "routes";
import pageRoutes from "page.routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "context/AuthContext";
import Basic from "./layouts/authentication/sign-in/basic";
import { ClientsProvider } from 'context/ClientsContext';
import FormListPage from "./layouts/pages/formbuilder";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { authToken, authOverride } = useAuth();
  const isAuthenticated = !!authToken;
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Create RTL Cache only once
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

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
      if (route.collapse) return getRoutes(route.collapse);

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

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <AuthProvider>
      <ClientsProvider>
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && !pathname.startsWith("/booking") && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={transparentSidenav || whiteSidenav ? brandDark : brandWhite}
                brandName="RabbitAI"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
            </>
          )}
          <Routes>
            {getRoutes(routes)}
            {getRoutes(pageRoutes)}
            <Route path="/login" element={<Basic />} />
            <Route path="/" element={isAuthenticated || authOverride ? <FormListPage /> : <Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to={isAuthenticated || authOverride ? "/dashboards/analytics" : "/login"} replace />} />
          </Routes>
          {layout === "dashboard" && !pathname.startsWith("/booking") && configsButton}
        </ThemeProvider>
      </ClientsProvider>
    </AuthProvider>
  );
}
