import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Button, IconButton } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import DataTable from 'examples/Tables/DataTable';
import axios from 'axios';
import TemplateWizard from './components/TemplateWizard'; // Adjust the import path as needed
import EditTemplate from './components/EditTemplate'; // Adjust the import path as needed
import EditPhase from './components/EditPhase';
import EditTask from './components/EditTask';
import EditSprint from './components/EditSprint';
import EditStory from './components/EditStory';
import { Edit, Delete } from '@mui/icons-material';

const TemplateBuilderPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditPhaseOpen, setIsEditPhaseOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isEditSprintOpen, setIsEditSprintOpen] = useState(false);
  const [isEditStoryOpen, setIsEditStoryOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditClick = (templateId) => {
    setSelectedTemplateId(templateId);
    setIsEditOpen(true);
  };

  const handleDeleteClick = async (templateId) => {
    try {
      await axios.delete(`https://app.webitservices.com/api/templates/${templateId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const fetchData = async () => {
    try {
      const templatesResponse = await axios.get('https://app.webitservices.com/api/templates');
      setTemplates(templatesResponse.data);
      const phasesResponse = await axios.get('https://app.webitservices.com/api/template/phases');
      setPhases(phasesResponse.data);
      const tasksResponse = await axios.get('https://app.webitservices.com/api/template/tasks');
      setTasks(tasksResponse.data);
      const sprintsResponse = await axios.get('https://app.webitservices.com/api/template/sprints');
      setSprints(sprintsResponse.data);
      const storiesResponse = await axios.get('https://app.webitservices.com/api/template/stories');
      setStories(storiesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const templatesColumns = [
    { Header: 'Template Name', accessor: 'name' },
    { Header: 'Methodology', accessor: 'methodology' },
    { Header: 'Created At', accessor: 'created_at' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => handleEditClick(row.original.id)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.original.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  const phasesColumns = [
    { Header: 'Phase Name', accessor: 'name' },
    { Header: 'Start Date', accessor: 'start_date' },
    { Header: 'End Date', accessor: 'end_date' },
    { Header: 'Budget Hours', accessor: 'budget_hours' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => {
            setSelectedPhaseId(row.original.id);
            setIsEditPhaseOpen(true);
          }}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.original.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  const tasksColumns = [
    { Header: 'Task Name', accessor: 'name' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Start Date', accessor: 'start_date' },
    { Header: 'End Date', accessor: 'end_date' },
    { Header: 'Budget Hours', accessor: 'budget_hours' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => {
            setSelectedTaskId(row.original.id);
            setIsEditTaskOpen(true);
          }}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.original.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  const sprintsColumns = [
    { Header: 'Sprint Name', accessor: 'name' },
    { Header: 'Start Date', accessor: 'start_date' },
    { Header: 'End Date', accessor: 'end_date' },
    { Header: 'Budget Hours', accessor: 'budget_hours' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => {
            setSelectedSprintId(row.original.id);
            setIsEditSprintOpen(true);
          }}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.original.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  const storiesColumns = [
    { Header: 'Story Name', accessor: 'name' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Start Date', accessor: 'start_date' },
    { Header: 'End Date', accessor: 'end_date' },
    { Header: 'Budget Hours', accessor: 'budget_hours' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => {
            setSelectedStoryId(row.original.id);
            setIsEditStoryOpen(true);
          }}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.original.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardLayout>
        <DashboardNavbar />
        <Grid container spacing={3} padding={3}>
          <Grid item xs={12}>
            <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
              <Tab label="Templates" />
              <Tab label="Waterfall" />
              <Tab label="Agile" />
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button variant="contained" color="primary" onClick={() => setIsWizardOpen(true)}>
                    Add Template
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <DataTable table={{ columns: templatesColumns, rows: templates }} />
                </Grid>
              </Grid>
            )}
            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button variant="contained" color="primary">
                    Add Phase
                  </Button>
                  <Button variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                    Add Task
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <DataTable table={{ columns: phasesColumns, rows: phases }} />
                </Grid>
                <Grid item xs={12}>
                  <DataTable table={{ columns: tasksColumns, rows: tasks }} />
                </Grid>
              </Grid>
            )}
            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button variant="contained" color="primary">
                    Add Sprint
                  </Button>
                  <Button variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                    Add Story
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <DataTable table={{ columns: sprintsColumns, rows: sprints }} />
                </Grid>
                <Grid item xs={12}>
                  <DataTable table={{ columns: storiesColumns, rows: stories }} />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Footer />
        <TemplateWizard open={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
        <EditTemplate open={isEditOpen} onClose={() => setIsEditOpen(false)} templateId={selectedTemplateId} />
        <EditPhase open={isEditPhaseOpen} onClose={() => setIsEditPhaseOpen(false)} phaseId={selectedPhaseId} />
        <EditTask open={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} taskId={selectedTaskId} />
        <EditSprint open={isEditSprintOpen} onClose={() => setIsEditSprintOpen(false)} sprintId={selectedSprintId} />
        <EditStory open={isEditStoryOpen} onClose={() => setIsEditStoryOpen(false)} storyId={selectedStoryId} />
      </DashboardLayout>
    </DndProvider>
  );
};

export default TemplateBuilderPage;
