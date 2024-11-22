import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

const FormPreview = ({ formComponents, onClose }) => {
  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle>Form Preview</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {formComponents.map((comp, index) => (
            <Grid item xs={comp.span} key={index}>
              <MDBox mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  {comp.label}
                </Typography>
                {comp.id.startsWith("textbox") && (
                  <input type="text" placeholder="Enter text" style={{ width: "100%", padding: "8px" }} />
                )}
                {comp.id.startsWith("textarea") && (
                  <textarea rows="4" placeholder="Enter detailed text" style={{ width: "100%", padding: "8px" }} />
                )}
                {comp.id.startsWith("checkbox") && (
                  <input type="checkbox" style={{ marginRight: "8px" }} />
                )}
                {comp.id.startsWith("radio") && (
                  <input type="radio" style={{ marginRight: "8px" }} />
                )}
                {comp.id.startsWith("dropdown") && (
                  <select style={{ width: "100%", padding: "8px" }}>
                    {comp.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {comp.id.startsWith("multiselect") && (
                  <select multiple style={{ width: "100%", padding: "8px" }}>
                    {comp.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {comp.id.startsWith("datepicker") && (
                  <input type="date" style={{ width: "100%", padding: "8px" }} />
                )}
                {comp.id.startsWith("switch") && (
                  <input type="checkbox" style={{ marginRight: "8px" }} />
                )}
                {comp.id.startsWith("slider") && (
                  <input type="range" min={comp.min} max={comp.max} style={{ width: "100%" }} />
                )}
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="primary">
          Close
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default FormPreview;
