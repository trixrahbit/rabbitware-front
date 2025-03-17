// react-router components
import { Link } from "react-router-dom";

// prop-types is library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React base styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

function ProfileInfoCard({ title, description, info, social, action, shadow }) {
  const labels = [];
  const values = [];
  const { socialMediaColors } = colors;
  const { size } = typography;

  // Convert object keys (camelCase) into readable text
  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(uppercaseLetter, ` ${uppercaseLetter.toLowerCase()}`);
      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  // Push the object values into the values array
  Object.values(info).forEach((el) => values.push(el));

  // Render the card info items with fallback values
  const renderItems = labels.map((label, key) => (
    <MDBox key={label} display="flex" py={1} pr={2}>
      <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
        {label}: &nbsp;
      </MDTypography>
      <MDTypography variant="button" fontWeight="regular" color="text">
        &nbsp;{values[key] ?? "N/A"} {/* ✅ Ensure no missing values */}
      </MDTypography>
    </MDBox>
  ));

  return (
    <Card sx={{ height: "100%", boxShadow: !shadow && "none" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>

        {/* ✅ Only render if action exists */}
        {action?.route && action?.tooltip ? (
          <MDTypography component={Link} to={action.route} variant="body2" color="secondary">
            <Tooltip title={action.tooltip} placement="top">
              <Icon>edit</Icon>
            </Tooltip>
          </MDTypography>
        ) : null}
      </MDBox>

      <MDBox p={2}>
        {/* ✅ Ensure description is always present */}
        <MDBox mb={2} lineHeight={1}>
          <MDTypography variant="button" color="text" fontWeight="light">
            {description || "No description available"}
          </MDTypography>
        </MDBox>

        <MDBox opacity={0.3}>
          <Divider />
        </MDBox>

        <MDBox>{renderItems}</MDBox>
      </MDBox>
    </Card>
  );
}

// ✅ Default props to prevent missing values
ProfileInfoCard.defaultProps = {
  shadow: true,
  title: "Profile Details",
  description: "No description available",
  info: {},
  action: null, // ✅ Make `action` optional
};

// ✅ Typechecking for props
ProfileInfoCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  info: PropTypes.objectOf(PropTypes.string),
  action: PropTypes.shape({
    route: PropTypes.string,
    tooltip: PropTypes.string,
  }),
  shadow: PropTypes.bool,
};

export default ProfileInfoCard;
