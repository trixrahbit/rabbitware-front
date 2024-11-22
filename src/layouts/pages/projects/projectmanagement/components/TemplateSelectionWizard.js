import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";

const TemplateSelectionWizard = ({ open, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("http://localhost:8000/templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleCreateProject = async () => {
    try {
      const newProject = {
        ...projectDetails,
        phases: selectedTemplate.phases,
        tasks: selectedTemplate.tasks,
        sprints: selectedTemplate.sprints,
        stories: selectedTemplate.stories,
      };
      const response = await axios.post("http://localhost:8000/projects", newProject);
      onClose();
      // Navigate to the newly created project page, if needed
    } catch (error) {
      console.error("Error creating project from template:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Select Template</DialogTitle>
      <DialogContent>
        {selectedTemplate ? (
          <div>
            <TextField
              label="Project Name"
              fullWidth
              value={projectDetails.name}
              onChange={(e) => setProjectDetails({ ...projectDetails, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Project Description"
              fullWidth
              value={projectDetails.description}
              onChange={(e) => setProjectDetails({ ...projectDetails, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6">Template: {selectedTemplate.name}</Typography>
            <Box mt={2}>
              <Typography variant="subtitle1">Phases:</Typography>
              {selectedTemplate.phases.map((phase, index) => (
                <Typography key={index}>{phase.name}</Typography>
              ))}
              <Typography variant="subtitle1">Tasks:</Typography>
              {selectedTemplate.tasks.map((task, index) => (
                <Typography key={index}>{task.name}</Typography>
              ))}
              <Typography variant="subtitle1">Sprints:</Typography>
              {selectedTemplate.sprints.map((sprint, index) => (
                <Typography key={index}>{sprint.name}</Typography>
              ))}
              <Typography variant="subtitle1">Stories:</Typography>
              {selectedTemplate.stories.map((story, index) => (
                <Typography key={index}>{story.name}</Typography>
              ))}
            </Box>
          </div>
        ) : (
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleSelectTemplate(template)}
                >
                  {template.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {selectedTemplate && (
          <Button onClick={handleCreateProject} color="primary">
            Create Project
          </Button>
        )}
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelectionWizard;
