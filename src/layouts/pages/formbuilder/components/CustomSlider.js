import React from "react";
import { Slider, Typography } from "@mui/material";
import MDBox from "components/MDBox";

const CustomSlider = ({ label, min = 0, max = 100, defaultValue = 50 }) => {
  return (
    <MDBox px={2}>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        defaultValue={defaultValue}
        min={min}
        max={max}
        track="normal"
        valueLabelDisplay="auto"
        sx={{
          color: 'primary.main', // Ensure color is set to a valid color
          '& .MuiSlider-thumb': {
            color: '#1976d2', // Default blue color
          },
          '& .MuiSlider-track': {
            color: '#1976d2',
          },
          '& .MuiSlider-rail': {
            color: '#bdbdbd',
          },
        }}
      />
    </MDBox>
  );
};

export default CustomSlider;
