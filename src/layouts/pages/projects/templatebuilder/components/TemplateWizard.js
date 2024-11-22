import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { useDrop, useDrag } from "react-dnd";
import axios from "axios";

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

const TemplateWizard = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [methodology, setMethodology] = useState("");
  const [templateId, setTemplateId] = useState(null);
  const [templateItems, setTemplateItems] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    start_date: "",
    end_date: "",
    budget_hours: "",
    type: "",
  });

  const steps = ["Template Details", "Add Items", "Review & Save"];

const handleNext = async () => {
  if (activeStep === 0) {
    // Save the template and get the template ID
    try {
      const response = await axios.post("http://localhost:8000/templates", {
        name,
        description,
        methodology,
        phases: [],
        tasks: [],
        sprints: [],
        stories: []
      });
      setTemplateId(response.data.id);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  } else {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }
};


  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddItem = async () => {
    let endpoint = "";
    if (newItem.type === "phase") {
      endpoint = "http://localhost:8000/template/phases";
      setPhases([...phases, newItem]);
    } else if (newItem.type === "task") {
      endpoint = "http://localhost:8000/template/tasks";
      setTasks([...tasks, newItem]);
    } else if (newItem.type === "sprint") {
      endpoint = "http://localhost:8000/template/sprints";
      setSprints([...sprints, newItem]);
    } else if (newItem.type === "story") {
      endpoint = "http://localhost:8000/template/stories";
      setStories([...stories, newItem]);
    }

    try {
      const response = await axios.post(endpoint, { ...newItem, template_id: templateId });
      const savedItem = response.data;
      setTemplateItems([...templateItems, savedItem]);
    } catch (error) {
      console.error("Error saving item:", error);
    }

    setIsItemModalOpen(false);
    setNewItem({
      name: "",
      start_date: "",
      end_date: "",
      budget_hours: "",
      type: "",
    });
  };

  const [, drop] = useDrop({
    accept: [
      ItemTypes.PHASE,
      ItemTypes.TASK,
      ItemTypes.SPRINT,
      ItemTypes.STORY,
    ],
    drop: (item) => {
      setTemplateItems([...templateItems, item]);
    },
  });

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <TextField
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Template Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Methodology"
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2, "& .MuiInputBase-root": { height: 56 } }}
            >
              <MenuItem value="waterfall">Waterfall</MenuItem>
              <MenuItem value="agile">Agile</MenuItem>
            </TextField>
          </div>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="info"
                onClick={() => setIsItemModalOpen(true)}
              >
                Add Item
              </Button>
              <Box
                ref={drop}
                sx={{
                  padding: 2,
                  border: "1px solid black",
                  minHeight: "400px",
                  backgroundColor: "#f0f0f0",
                  marginTop: 2,
                }}
              >
                {templateItems.map((item, index) => {
                  if (item.type === "phase") {
                    return <Phase key={index} phase={item} index={index} />;
                  } else if (item.type === "task") {
                    return <Task key={index} task={item} index={index} />;
                  } else if (item.type === "sprint") {
                    return <Sprint key={index} sprint={item} index={index} />;
                  } else if (item.type === "story") {
                    return <Story key={index} story={item} index={index} />;
                  }
                  return null;
                })}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {methodology === "waterfall" && (
                <>
                  {phases.map((phase, index) => (
                    <Phase key={index} phase={phase} index={index} />
                  ))}
                  {tasks.map((task, index) => (
                    <Task key={index} task={task} index={index} />
                  ))}
                </>
              )}
              {methodology === "agile" && (
                <>
                  {sprints.map((sprint, index) => (
                    <Sprint key={index} sprint={sprint} index={index} />
                  ))}
                  {stories.map((story, index) => (
                    <Story key={index} story={story} index={index} />
                  ))}
                </>
              )}
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Review Template
            </Typography>
            {templateItems.map((item, index) => (
              <Typography key={index}>
                {item.name} ({item.type})
              </Typography>
            ))}
          </div>
        );
      default:
        return "Unknown step";
    }
  };

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setName("");
      setDescription("");
      setMethodology("");
      setTemplateItems([]);
      setPhases([]);
      setTasks([]);
      setSprints([]);
      setStories([]);
      setIsItemModalOpen(false);
      setNewItem({
        name: "",
        start_date: "",
        end_date: "",
        budget_hours: "",
        type: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Template</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={3}>{renderStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions>
        {activeStep === steps.length - 1 ? (
          <Button onClick={onClose} variant="contained" color="success">
            Save Template
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" color="primary">
            Next
          </Button>
        )}
        {activeStep !== 0 && (
          <Button onClick={handleBack} variant="contained" color="primary">
            Back
          </Button>
        )}
        <Button onClick={onClose} variant="contained" color="error">
          Cancel
        </Button>
      </DialogActions>
      <Dialog open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            required
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            required
            value={newItem.start_date}
            onChange={(e) => setNewItem({ ...newItem, start_date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            required
            value={newItem.end_date}
            onChange={(e) => setNewItem({ ...newItem, end_date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Budget Hours"
            type="number"
            fullWidth
            required
            value={newItem.budget_hours}
            onChange={(e) => setNewItem({ ...newItem, budget_hours: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Type"
            select
            fullWidth
            required
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            sx={{
              "& .MuiInputBase-root": {
                height: 56,
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            {methodology === "waterfall" ? (
              [<MenuItem key="phase" value="phase">Phase</MenuItem>, <MenuItem key="task" value="task">Task</MenuItem>]
            ) : (
              [<MenuItem key="sprint" value="sprint">Sprint</MenuItem>, <MenuItem key="story" value="story">Story</MenuItem>]
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsItemModalOpen(false)} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleAddItem} variant="contained" color="info">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default TemplateWizard;
