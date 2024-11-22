import { useState, useEffect } from "react"; // Removed unnecessary imports
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import backgroundImage from "assets/images/bg-profile.jpeg";
import { useUserInfo } from "layouts/pages/profile/profile-overview/data/profile_data"; // Adjust the path accordingly
import burceMars from "assets/images/bruce-mars.jpg";

function Header({ children }) {
  const { userInfo, isLoading, error } = useUserInfo(); // Use the hook to get user info

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user info</div>;

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar src={userInfo?.avatar || burceMars} alt="profile-image" size="xl" shadow="sm" />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {userInfo?.name || "User Name"} {/* Dynamic name */}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {userInfo?.title || "User Role"} {/* Dynamic title/role */}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;


