import React, { useState } from "react";
import { Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useDrop, useDrag } from "react-dnd";

const ItemTypes = {
  PHASE: "phase",
  TASK: "task",
  SPRINT: "sprint",
  STORY: "story"
};

const Phase = ({ phase, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.PHASE,
    item: { phase, index }
  });

  return (
    <div ref={ref} style={{ padding: "8px", border: "1px solid black", margin: "4px", backgroundColor: "white" }}>
      {phase.name}
    </div>
  );
};

const Task = ({ task, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.TASK,
    item: { task, index }
  });

  return (
    <div ref={ref} style={{ padding: "8px", border: "1px solid black", margin: "4px", backgroundColor: "white" }}>
      {task.name}
    </div>
  );
};

const Sprint = ({ sprint, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.SPRINT,
    item: { sprint, index }
  });

  return (
    <div ref={ref} style={{ padding: "8px", border: "1px solid black", margin: "4px", backgroundColor: "white" }}>
      {sprint.name}
    </div>
  );
};

const Story = ({ story, index }) => {
  const [, ref] = useDrag({
    type: ItemTypes.STORY,
    item: { story, index }
  });

  return (
    <div ref={ref} style={{ padding: "8px", border: "1px solid black", margin: "4px", backgroundColor: "white" }}>
      {story.name}
    </div>
  );
};

const TemplateBuilder = ({ methodology, onClose }) => {
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [templateItems, setTemplateItems] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", start_date: "", end_date: "", budget_hours: "" });

  const [, drop] = useDrop({
    accept: [ItemTypes.PHASE, ItemTypes.TASK, ItemTypes.SPRINT, ItemTypes.STORY],
    drop: (item, monitor) => {
      setTemplateItems([...templateItems, item]);
    }
  });

  const handleAddItem = () => {
    if (methodology === "waterfall") {
      if (newItem.type === "phase") {
        setPhases([...phases, newItem]);
      } else if (newItem.type === "task") {
        setTasks([...tasks, newItem]);
      }
    } else if (methodology === "agile") {
      if (newItem.type === "sprint") {
        setSprints([...sprints, newItem]);
      } else if (newItem.type === "story") {
        setStories([...stories, newItem]);
      }
    }
    setIsItemModalOpen(false);
  };

  return (
    <Dialog open fullWidth onClose={onClose}>
      <DialogTitle>Build Template</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Button variant="contained" color="primary" onClick={() => setIsItemModalOpen(true)}>
              Add Item
            </Button>
            <div ref={drop} style={{ padding: "16px", border: "1px solid black", minHeight: "400px", backgroundColor: "#f0f0f0" }}>
              {templateItems.map((item, index) => {
                if (item.type === "phase") {
                  return <Phase key={index} phase={item.phase} index={index} />;
                } else if (item.type === "task") {
                  return <Task key={index} task={item.task} index={index} />;
                } else if (item.type === "sprint") {
                  return <Sprint key={index} sprint={item.sprint} index={index} />;
                } else if (item.type === "story") {
                  return <Story key={index} story={item.story} index={index} />;
                }
                return null;
              })}
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* List of available items based on methodology */}
            {methodology === "waterfall" && (
              <div>
                {phases.map((phase, index) => (
                  <Phase key={index} phase={phase} index={index} />
                ))}
                {tasks.map((task, index) => (
                  <Task key={index} task={task} index={index} />
                ))}
              </div>
            )}
            {methodology === "agile" && (
              <div>
                {sprints.map((sprint, index) => (
                  <Sprint key={index} sprint={sprint} index={index} />
                ))}
                {stories.map((story, index) => (
                  <Story key={index} story={story} index={index} />
                ))}
              </div>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose} color="primary">Save Template</Button>
      </DialogActions>
      <Dialog open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
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
            value={newItem.budget_hours}
            onChange={(e) => setNewItem({ ...newItem, budget_hours: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Type"
            select
            fullWidth
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
          >
            {methodology === "waterfall" && (
              <>
                <MenuItem value="phase">Phase</MenuItem>
                <MenuItem value="task">Task</MenuItem>
              </>
            )}
            {methodology === "agile" && (
              <>
                <MenuItem value="sprint">Sprint</MenuItem>
                <MenuItem value="story">Story</MenuItem>
              </>
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsItemModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default TemplateBuilder;
