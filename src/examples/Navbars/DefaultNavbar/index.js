import { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React context
import { useMaterialUIController } from "context";

function DefaultNavbar({ brand, transparent, light, action }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const openMobileNavbar = () => setMobileNavbar(!mobileNavbar);

  useEffect(() => {
    function displayMobileNavbar() {
      if (window.innerWidth < 1200) {
        setMobileView(true);
        setMobileNavbar(false);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    window.addEventListener("resize", displayMobileNavbar);
    displayMobileNavbar();
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  return (
    <Container>
      <MDBox
        py={1}
        px={{ xs: 4, sm: transparent ? 2 : 3, lg: transparent ? 0 : 2 }}
        my={3}
        mx={3}
        width="calc(100% - 48px)"
        borderRadius="lg"
        shadow={transparent ? "none" : "md"}
        color={light ? "white" : "dark"}
        position="absolute"
        left={0}
        zIndex={99}
        sx={(theme) => ({
          backgroundColor: transparent
            ? theme.palette.transparent.main
            : theme.functions.rgba(darkMode ? theme.palette.background.sidenav : theme.palette.white.main, 0.8),
          backdropFilter: transparent ? "none" : "saturate(200%) blur(30px)",
        })}
      >
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography
              variant="button"
              fontWeight="bold"
              color={light ? "white" : "dark"}
              sx={{ fontSize: "1.3rem" }} // Increase font size
            >
              {brand}
            </MDTypography>


          {action &&
            (action.type === "internal" ? (
              <MDBox display={{ xs: "none", lg: "inline-block" }}>
                <MDButton variant="gradient" color={action.color || "info"} size="small">
                  {action.label}
                </MDButton>
              </MDBox>
            ) : (
              <MDBox display={{ xs: "none", lg: "inline-block" }}>
                <MDButton
                  component="a"
                  href={action.route}
                  target="_blank"
                  rel="noreferrer"
                  variant="gradient"
                  color={action.color || "info"}
                  size="small"
                  sx={{ mt: -0.3 }}
                >
                  {action.label}
                </MDButton>
              </MDBox>
            ))}

          <MDBox
            display={{ xs: "inline-block", lg: "none" }}
            lineHeight={0}
            py={1.5}
            pl={1.5}
            color={transparent ? "white" : "inherit"}
            sx={{ cursor: "pointer" }}
            onClick={openMobileNavbar}
          >
            <Icon fontSize="default">{mobileNavbar ? "close" : "menu"}</Icon>
          </MDBox>
        </MDBox>
      </MDBox>
    </Container>
  );
}

// Default props
DefaultNavbar.defaultProps = {
  brand: "RabbitAI",
  transparent: false,
  light: false,
  action: false,
};

// PropTypes validation
DefaultNavbar.propTypes = {
  brand: PropTypes.string,
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.string,
      label: PropTypes.string.isRequired,
    }),
  ]),
};

export default DefaultNavbar;
