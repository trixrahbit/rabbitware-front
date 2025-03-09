import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useClients } from "context/ClientsContext";
import { useNavigate } from "react-router-dom";
import { useDrop, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

const ItemTypes = {
  PHASE: "phase",
  TASK: "task",
  SPRINT: "sprint",
  STORY: "story",
};

const Phase = ({ phase, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.PHASE,
    item: { phase, index },
  });

  return (
    <Box
      ref={ref}
      sx={{
        padding: 2,
        border: "1px solid black",
        margin: 1,
        backgroundColor: "white",
      }}
    >
      {phase.name}
    </Box>
  );
};

const Task = ({ task, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.TASK,
    item: { task, index },
  });

  return (
    <Box
      ref={ref}
      sx={{
        padding: 2,
        border: "1px solid black",
        margin: 1,
        backgroundColor: "white",
      }}
    >
      {task.name}
    </Box>
  );
};

const Sprint = ({ sprint, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.SPRINT,
    item: { sprint, index },
  });

  return (
    <Box
      ref={ref}
      sx={{
        padding: 2,
        border: "1px solid black",
        margin: 1,
        backgroundColor: "white",
      }}
    >
      {sprint.name}
    </Box>
  );
};

const Story = ({ story, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.STORY,
    item: { story, index },
  });

  return (
    <Box
      ref={ref}
      sx={{
        padding: 2,
        border: "1px solid black",
        margin: 1,
        backgroundColor: "white",
      }}
    >
      {story.name}
    </Box>
  );
};

const AddProjectWizard = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isFromScratch, setIsFromScratch] = useState(false);
  const [isFromTemplate, setIsFromTemplate] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    clientId: "",
    methodology: "",
    phases: [],
    tasks: [],
    sprints: [],
    stories: [],
  });
  const { clients } = useClients();
  const navigate = useNavigate();
  const theme = useTheme();

  const steps = ["Client Details", "Select Methodology", "Finish"];
  const templateSteps = ["Select Template", "Client Details", "Review & Finish"];

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("https://app.webitservices.com/api/templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

const handleSaveProject = async () => {
  try {
    const payload = {
      name: newProject.name,
      description: newProject.description,
      client_id: parseInt(newProject.clientId) || null,
      methodology: newProject.methodology,
      phases: newProject.phases?.length ? newProject.phases.map(phase => ({
        ...phase,
        project_id: newProject.id || null
      })) : [],
      tasks: newProject.tasks?.length ? newProject.tasks.map(task => ({
        ...task,
        project_id: newProject.id || null
      })) : [],
      sprints: newProject.sprints?.length ? newProject.sprints.map(sprint => ({
        ...sprint,
        project_id: newProject.id || null
      })) : [],
      stories: newProject.stories?.length ? newProject.stories.map(story => ({
        ...story,
        project_id: newProject.id || null
      })) : [],
    };

    console.log('Sending payload:', payload); // Log the payload
    const response = await axios.post("https://app.webitservices.com/api/projects", payload);
    navigate(`/projects/${response.data.id}`);
    onClose();
  } catch (error) {
    console.error("Error saving project:", error);
  }
};



  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
    setNewProject({
      ...newProject,
      phases: template.phases,
      tasks: template.tasks,
      sprints: template.sprints,
      stories: template.stories,
      methodology: template.methodology,
    });
    handleNext();
  };

  const renderInitialStep = () => (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <Button variant="contained" onClick={() => { setIsFromScratch(true); handleNext(); }}>
          From Scratch
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={() => { setIsFromTemplate(true); handleNext(); }}>
          From Template
        </Button>
      </Grid>
    </Grid>
  );

  const renderTemplateSelectionStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          select
          label="Select Template"
          fullWidth
          value={selectedTemplate ? selectedTemplate.id : ""}
          onChange={(e) => {
            const template = templates.find(t => t.id === parseInt(e.target.value));
            handleTemplateSelection(template);
          }}
        >
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );

  const renderClientDetailsStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          sx={{
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          sx={{
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="dense"
          label="Client"
          select
          fullWidth
          value={newProject.clientId}
          onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
          sx={{
            "& .MuiInputBase-root": {
              height: "56px",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );

  const renderMethodologyStep = () => (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setNewProject({ ...newProject, methodology: "waterfall" })}
        >
          Waterfall
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setNewProject({ ...newProject, methodology: "agile" })}
        >
          Agile
        </Button>
      </Grid>
    </Grid>
  );

  const renderReviewStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <p>Review the project details and click Finish to create the project.</p>
        <p><strong>Project Name:</strong> {newProject.name}</p>
        <p><strong>Description:</strong> {newProject.description}</p>
        <p><strong>Client:</strong> {clients.find(client => client.id === newProject.clientId)?.name}</p>
        <p><strong>Methodology:</strong> {newProject.methodology}</p>
      </Grid>
    </Grid>
  );

  const renderStepContent = (step) => {
    if (isFromScratch) {
      switch (step) {
        case 0:
          return renderClientDetailsStep();
        case 1:
          return renderMethodologyStep();
        case 2:
          return renderReviewStep();
        default:
          return "Unknown step";
      }
    } else if (isFromTemplate) {
      switch (step) {
        case 0:
          return renderTemplateSelectionStep();
        case 1:
          return renderClientDetailsStep();
        case 2:
          return renderReviewStep();
        default:
          return "Unknown step";
      }
    } else {
      return renderInitialStep();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
        >
          Add New Project
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Stepper activeStep={activeStep}>
            {(isFromScratch ? steps : templateSteps).map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          {activeStep === (isFromScratch ? steps.length : templateSteps.length) - 1 ? (
            <Button onClick={handleSaveProject} color="primary">
              Finish
            </Button>
          ) : (
            <Button onClick={handleNext} color="primary">
              Next
            </Button>
          )}
          {activeStep !== 0 && (
            <Button onClick={handleBack} color="secondary">
              Back
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default AddProjectWizard;
