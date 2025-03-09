import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, Typography, Paper, Grid, IconButton, Modal } from "@mui/material";
import { Edit, Delete, PlaylistAddCheck } from "@mui/icons-material";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AddItemModal from "../projectmanagement/components/AddItemModal";
import ChecklistViewer from "../../checklists/components/ChecklistViewer";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


// Error handling function
const handleRequestError = (error) => {
  if (error.response) {
    console.error('Data:', error.response.data);
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    console.error('Request:', error.request);
  } else {
    console.error('Error:', error.message);
  }
};
// Helper function to reorder the list
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ProjectEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: '',
    description: '',
    methodology: '',
    phases: [],
    sprints: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecklistViewerOpen, setIsChecklistViewerOpen] = useState(false);
  const [currentItemType, setCurrentItemType] = useState("");
  const [currentItemId, setCurrentItemId] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`https://app.webitservices.com/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleAddItem = async (item) => {
    try {
      if (project) {
        if (currentItemType === "Phase") {
          const response = await axios.post(`https://app.webitservices.com/api/phases`, {
            ...item,
            project_id: project.id,
          });
          setProject((prevProject) => ({
            ...prevProject,
            phases: [...prevProject.phases, response.data],
          }));
        } else if (currentItemType === "Task") {
          const phase_id = project.phases.length > 0 ? project.phases[project.phases.length - 1].id : null;
          const response = await axios.post(`https://app.webitservices.com/api/tasks`, {
            ...item,
            project_id: project.id,
            phase_id: phase_id,
          });
          setProject((prevProject) => ({
            ...prevProject,
            phases: prevProject.phases.map((phase) =>
              phase.id === phase_id
                ? { ...phase, tasks: [...phase.tasks, response.data] }
                : phase
            ),
          }));
        } else if (currentItemType === "Sprint") {
          const response = await axios.post(`https://app.webitservices.com/api/sprints`, {
            ...item,
            project_id: project.id,
          });
          setProject((prevProject) => ({
            ...prevProject,
            sprints: [...prevProject.sprints, response.data],
          }));
        } else if (currentItemType === "Story") {
          const sprint_id = project.sprints.length > 0 ? project.sprints[project.sprints.length - 1].id : null;
          const response = await axios.post(`https://app.webitservices.com/api/stories`, {
            ...item,
            project_id: project.id,
            sprint_id: sprint_id,
          });
          setProject((prevProject) => ({
            ...prevProject,
            sprints: prevProject.sprints.map((sprint) =>
              sprint.id === sprint_id
                ? { ...sprint, stories: [...sprint.stories, response.data] }
                : sprint
            ),
          }));
        }
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDeleteItem = async (itemType, itemId) => {
    try {
      await axios.delete(`https://app.webitservices.com/api/${itemType}/${itemId}`);
      setProject((prevProject) => {
        if (itemType === "phases") {
          return {
            ...prevProject,
            phases: prevProject.phases.filter(phase => phase.id !== itemId),
          };
        } else if (itemType === "tasks") {
          return {
            ...prevProject,
            phases: prevProject.phases.map(phase => ({
              ...phase,
              tasks: phase.tasks.filter(task => task.id !== itemId)
            })),
          };
        } else if (itemType === "sprints") {
          return {
            ...prevProject,
            sprints: prevProject.sprints.filter(sprint => sprint.id !== itemId),
          };
        } else if (itemType === "stories") {
          return {
            ...prevProject,
            sprints: prevProject.sprints.map(sprint => ({
              ...sprint,
              stories: sprint.stories.filter(story => story.id !== itemId)
            })),
          };
        }
        return prevProject;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEditItem = (itemType, itemId) => {
    navigate(`/edit/${itemType}/${itemId}`);
  };

  const handleChecklistClick = (itemType, itemId) => {
    setCurrentItemType(itemType);
    setCurrentItemId(itemId);
    setIsChecklistViewerOpen(true);
  };

  const moveTaskBetweenPhases = async (taskId, newPhaseId) => {
    try {
      const task = project.phases
        .flatMap(phase => phase.tasks)
        .find(task => task.id === taskId);

      const payload = {
        phase_id: newPhaseId,
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        budget_hours: task.budget_hours,
      };

      console.log(`Updating task ${taskId} with data:`, payload);
      await axios.put(`https://app.webitservices.com/api/tasks/${taskId}`, payload);
    } catch (error) {
      handleRequestError(error);
    }
  };

  const moveStoryBetweenSprints = async (storyId, newSprintId) => {
    try {
      const story = project.sprints
        .flatMap(sprint => sprint.stories)
        .find(story => story.id === storyId);

      const payload = {
        sprint_id: newSprintId,
        name: story.name,
        description: story.description,
        start_date: story.start_date,
        end_date: story.end_date,
        budget_hours: story.budget_hours,
      };

      console.log(`Updating story ${storyId} with data:`, payload);
      await axios.put(`https://app.webitservices.com/api/stories/${storyId}`, payload);
    } catch (error) {
      handleRequestError(error);
    }
  };

  const calculatePhaseBudgetHours = (phase) => {
    return phase.tasks.reduce((total, task) => total + (task.budget_hours || 0), 0);
  };

  const calculateSprintBudgetHours = (sprint) => {
    return sprint.stories.reduce((total, story) => total + (story.budget_hours || 0), 0);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Reordering within the same droppable
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "phases") {
        const newPhases = reorder(project.phases, source.index, destination.index);
        setProject((prevProject) => ({
          ...prevProject,
          phases: newPhases,
        }));
      } else if (source.droppableId.startsWith("tasks-")) {
        const phaseIndex = project.phases.findIndex(
          (phase) => phase.id.toString() === source.droppableId.split("-")[1]
        );
        const newTasks = reorder(
          project.phases[phaseIndex].tasks,
          source.index,
          destination.index
        );
        const newPhases = [...project.phases];
        newPhases[phaseIndex] = {
          ...newPhases[phaseIndex],
          tasks: newTasks,
          budget_hours: calculatePhaseBudgetHours(newPhases[phaseIndex]),
        };
        setProject((prevProject) => ({
          ...prevProject,
          phases: newPhases,
        }));
      } else if (source.droppableId === "sprints") {
        const newSprints = reorder(project.sprints, source.index, destination.index);
        setProject((prevProject) => ({
          ...prevProject,
          sprints: newSprints,
        }));
      } else if (source.droppableId.startsWith("stories-")) {
        const sprintIndex = project.sprints.findIndex(
          (sprint) => sprint.id.toString() === source.droppableId.split("-")[1]
        );
        const newStories = reorder(
          project.sprints[sprintIndex].stories,
          source.index,
          destination.index
        );
        const newSprints = [...project.sprints];
        newSprints[sprintIndex] = {
          ...newSprints[sprintIndex],
          stories: newStories,
          budget_hours: calculateSprintBudgetHours(newSprints[sprintIndex]),
        };
        setProject((prevProject) => ({
          ...prevProject,
          sprints: newSprints,
        }));
      }
    } else {
      // Moving between different droppables
      if (source.droppableId.startsWith("tasks-") && destination.droppableId.startsWith("tasks-")) {
        const sourcePhaseIndex = project.phases.findIndex(
          (phase) => phase.id.toString() === source.droppableId.split("-")[1]
        );
        const destinationPhaseIndex = project.phases.findIndex(
          (phase) => phase.id.toString() === destination.droppableId.split("-")[1]
        );
        const task = project.phases[sourcePhaseIndex].tasks[source.index];
        await moveTaskBetweenPhases(task.id, project.phases[destinationPhaseIndex].id);

        const newSourceTasks = Array.from(project.phases[sourcePhaseIndex].tasks);
        newSourceTasks.splice(source.index, 1);
        const newDestinationTasks = Array.from(project.phases[destinationPhaseIndex].tasks);
        newDestinationTasks.splice(destination.index, 0, task);

        const newPhases = [...project.phases];
        newPhases[sourcePhaseIndex] = {
          ...newPhases[sourcePhaseIndex],
          tasks: newSourceTasks,
          budget_hours: calculatePhaseBudgetHours(newPhases[sourcePhaseIndex]),
        };
        newPhases[destinationPhaseIndex] = {
          ...newPhases[destinationPhaseIndex],
          tasks: newDestinationTasks,
          budget_hours: calculatePhaseBudgetHours(newPhases[destinationPhaseIndex]),
        };

        setProject((prevProject) => ({
          ...prevProject,
          phases: newPhases,
        }));
      } else if (source.droppableId.startsWith("stories-") && destination.droppableId.startsWith("stories-")) {
        const sourceSprintIndex = project.sprints.findIndex(
          (sprint) => sprint.id.toString() === source.droppableId.split("-")[1]
        );
        const destinationSprintIndex = project.sprints.findIndex(
          (sprint) => sprint.id.toString() === destination.droppableId.split("-")[1]
        );
        const story = project.sprints[sourceSprintIndex].stories[source.index];
        await moveStoryBetweenSprints(story.id, project.sprints[destinationSprintIndex].id);

        const newSourceStories = Array.from(project.sprints[sourceSprintIndex].stories);
        newSourceStories.splice(source.index, 1);
        const newDestinationStories = Array.from(project.sprints[destinationSprintIndex].stories);
        newDestinationStories.splice(destination.index, 0, story);

        const newSprints = [...project.sprints];
        newSprints[sourceSprintIndex] = {
          ...newSprints[sourceSprintIndex],
          stories: newSourceStories,
          budget_hours: calculateSprintBudgetHours(newSprints[sourceSprintIndex]),
        };
        newSprints[destinationSprintIndex] = {
          ...newSprints[destinationSprintIndex],
          stories: newDestinationStories,
          budget_hours: calculateSprintBudgetHours(newSprints[destinationSprintIndex]),
        };

        setProject((prevProject) => ({
          ...prevProject,
          sprints: newSprints,
        }));
      }
    }
  };

  if (!project.name) {
    return <Typography>Loading...</Typography>;
  }

  const renderPhase = (phase, index) => (
    <Draggable key={phase.id} draggableId={`phase-${phase.id}`} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ marginBottom: 2, padding: 2, backgroundColor: 'white', boxShadow: 3 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" onClick={() => handleEditItem("phases", phase.id)}>{index + 1}. {phase.name}</Typography>
            <Box>
              <IconButton onClick={() => handleEditItem("phases", phase.id)}><Edit /></IconButton>
              <IconButton onClick={() => handleDeleteItem("phases", phase.id)}><Delete /></IconButton>
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography>Start Date: {phase.start_date || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography>End Date: {phase.end_date || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography>Budget Hours: {calculatePhaseBudgetHours(phase)}</Typography>
            </Grid>
          </Grid>
          <Droppable droppableId={`tasks-${phase.id}`}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'white',
                  padding: 2,
                  minHeight: 100
                }}
              >
                {phase.tasks.map((task, taskIndex) => (
                  <Draggable key={task.id} draggableId={`task-${task.id}`} index={taskIndex}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{ padding: 2, marginBottom: 1, backgroundColor: 'lightblue' }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" onClick={() => handleEditItem("tasks", task.id)}>{taskIndex + 1}. {task.name}</Typography>
                          <Box>
                            <IconButton onClick={() => handleEditItem("tasks", task.id)}><Edit /></IconButton>
                            <IconButton onClick={() => handleDeleteItem("tasks", task.id)}><Delete /></IconButton>
                            <IconButton onClick={() => handleChecklistClick("tasks", task.id)}><PlaylistAddCheck /></IconButton>
                          </Box>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography>Start Date: {task.start_date || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>End Date: {task.end_date || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>Budget Hours: {task.budget_hours || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Paper>
      )}
    </Draggable>
  );

  const renderSprint = (sprint, index) => (
    <Draggable key={sprint.id} draggableId={`sprint-${sprint.id}`} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ marginBottom: 2, padding: 2, backgroundColor: 'white', boxShadow: 3 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" onClick={() => handleEditItem("sprints", sprint.id)}>{index + 1}. {sprint.name}</Typography>
            <Box>
              <IconButton onClick={() => handleEditItem("sprints", sprint.id)}><Edit /></IconButton>
              <IconButton onClick={() => handleDeleteItem("sprints", sprint.id)}><Delete /></IconButton>
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography>Start Date: {sprint.start_date || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography>End Date: {sprint.end_date || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography>Budget Hours: {calculateSprintBudgetHours(sprint)}</Typography>
            </Grid>
          </Grid>
          <Droppable droppableId={`stories-${sprint.id}`}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'white',
                  padding: 2,
                  minHeight: 100
                }}
              >
                {sprint.stories.map((story, storyIndex) => (
                  <Draggable key={story.id} draggableId={`story-${story.id}`} index={storyIndex}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{ padding: 2, marginBottom: 1, backgroundColor: 'lightblue' }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" onClick={() => handleEditItem("stories", story.id)}>{storyIndex + 1}. {story.name}</Typography>
                          <Box>
                            <IconButton onClick={() => handleEditItem("stories", story.id)}><Edit /></IconButton>
                            <IconButton onClick={() => handleDeleteItem("stories", story.id)}><Delete /></IconButton>
                            <IconButton onClick={() => handleChecklistClick("stories", story.id)}><PlaylistAddCheck /></IconButton>
                          </Box>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography>Start Date: {story.start_date || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>End Date: {story.end_date || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>Budget Hours: {story.budget_hours || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Paper>
      )}
    </Draggable>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ padding: 2, overflow: "auto" }}>
        <Typography variant="h4">{project.name}</Typography>
        <Typography variant="body1">{project.description}</Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ width: '25%' }}>Name</Typography>
          <Typography variant="h6" sx={{ width: '25%' }}>Start Date</Typography>
          <Typography variant="h6" sx={{ width: '25%' }}>End Date</Typography>
          <Typography variant="h6" sx={{ width: '25%' }}>Budget Hours</Typography>
        </Box>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="phases">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {project.methodology === "waterfall" && (
                  <>
                    <Button variant="contained" color="primary" onClick={() => { setCurrentItemType("Phase"); setIsModalOpen(true); }}>Add Phase</Button>
                    <Button variant="contained" color="secondary" onClick={() => { setCurrentItemType("Task"); setIsModalOpen(true); }}>Add Task</Button>
                    {project.phases.map((phase, index) => renderPhase(phase, index))}
                  </>
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>

          <Droppable droppableId="sprints">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {project.methodology === "agile" && (
                  <>
                    <Button variant="contained" color="primary" onClick={() => { setCurrentItemType("Sprint"); setIsModalOpen(true); }}>Add Sprint</Button>
                    <Button variant="contained" color="secondary" onClick={() => { setCurrentItemType("Story"); setIsModalOpen(true); }}>Add Story</Button>
                    {project.sprints.map((sprint, index) => renderSprint(sprint, index))}
                  </>
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddItem}
        itemType={currentItemType}
      />
      {isChecklistViewerOpen && (
        <ChecklistViewer
          open={isChecklistViewerOpen}
          onClose={() => setIsChecklistViewerOpen(false)}
          itemType={currentItemType}
          itemId={currentItemId}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
};
export default ProjectEditor;
