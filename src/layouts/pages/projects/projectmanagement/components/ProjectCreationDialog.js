import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from "@mui/material";
import AddProjectWizard from "./AddProjectWizard";
import TemplateSelectionWizard from "./TemplateSelectionWizard";

const ProjectCreationDialog = ({ open, onClose }) => {
  const [selection, setSelection] = useState(null);

  const handleSelection = (choice) => {
    setSelection(choice);
  };

  const handleClose = () => {
    setSelection(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open && !selection} onClose={handleClose} fullWidth>
        <DialogTitle>Select Project Creation Method</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleSelection("scratch")}
                style={{ width: 200, height: 100 }}
              >
                From Scratch
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSelection("template")}
                style={{ width: 200, height: 100 }}
              >
                From Template
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {selection === "scratch" && (
        <AddProjectWizard open={open && selection === "scratch"} onClose={handleClose} />
      )}

      {selection === "template" && (
        <TemplateSelectionWizard open={open && selection === "template"} onClose={handleClose} />
      )}
    </>
  );
};

export default ProjectCreationDialog;
