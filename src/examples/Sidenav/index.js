import { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavList from "examples/Sidenav/SidenavList";
import SidenavItem from "examples/Sidenav/SidenavItem";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { useAuth } from "context/AuthContext";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const location = useLocation();
  const { pathname } = location;
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items.length > 1 ? items[1] : '';
  const itemName = items[items.length - 1];
  const visibleRoutes = routes.filter(route => !route.hidden);
  const { state } = useAuth();
  const [name, setUserName] = useState('Guest');

  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const [openCollapse, setOpenCollapse] = useState(collapseName);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(itemParentName);

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }
    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  const renderNestedCollapse = (collapse) => collapse.map(({ name, route, key, href }) => href ? (
    <Link
      key={key}
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={{ textDecoration: "none" }}
    >
      <SidenavItem name={name} nested />
    </Link>
  ) : (
    <NavLink to={route} key={key} sx={{ textDecoration: "none" }}>
      <SidenavItem name={name} active={route === pathname} nested />
    </NavLink>
  ));

  const renderCollapse = (collapses) => collapses.map(({ name, collapse, route, href, key, hidden }) => {
    let returnValue;
    if (collapse) {
      returnValue = (
        <SidenavItem
          key={key}
          color={color}
          name={name}
          active={key === itemParentName ? "isParent" : false}
          open={openNestedCollapse === key}
          onClick={({ currentTarget }) =>
            openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
              ? setOpenNestedCollapse(false)
              : setOpenNestedCollapse(key)
          }
        >
          {renderNestedCollapse(collapse.filter(f => !f.hidden))}
        </SidenavItem>
      );
    } else {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem color={color} name={name} active={key === itemName} />
        </Link>
      ) : !hidden ? (
        <NavLink to={route} key={key} sx={{ textDecoration: "none" }}>
          <SidenavItem color={color} name={name} active={key === itemName} />
        </NavLink>
      ) : <></>;
    }
    return <SidenavList key={key}>{returnValue}</SidenavList>;
  });

  const renderRoutes = visibleRoutes.map(({ type, name, icon, title, collapse, noCollapse, key, href, route }) => {
    let returnValue;
    if (type === "collapse") {
      returnValue = collapse ? (
        <SidenavCollapse
          key={key}
          name={name}
          icon={icon}
          active={key === collapseName}
          open={openCollapse === key}
          onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
        >
          {collapse ? renderCollapse(collapse) : null}
        </SidenavCollapse>
      ) : null;
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = <Divider key={key} />;
    }
    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;

