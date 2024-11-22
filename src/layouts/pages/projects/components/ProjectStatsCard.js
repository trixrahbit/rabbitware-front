import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import MDBox from "components/MDBox";

const ProjectStatsCard = () => {
  return (
    <Card>
      <CardContent>
        <MDBox>
          <Typography variant="h6">Project Stats</Typography>
          {/* Add your stats here */}
          <Typography variant="body2">Total Projects: 10</Typography>
          <Typography variant="body2">Active Projects: 5</Typography>
          <Typography variant="body2">Completed Projects: 3</Typography>
          <Typography variant="body2">Pending Projects: 2</Typography>
        </MDBox>
      </CardContent>
    </Card>
  );
};

export default ProjectStatsCard;
