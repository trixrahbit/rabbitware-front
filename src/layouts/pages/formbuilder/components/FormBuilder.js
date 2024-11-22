import React, { useState } from "react";
import { Grid, Paper, TextField, MenuItem, FormControlLabel, Switch, Radio, Checkbox } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Typography from "@mui/material/Typography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDDatePicker from "components/MDDatePicker";
import FormPreview from "../components/FormPreview";

import TextFieldsIcon from "@mui/icons-material/TextFields";
import TextareaIcon from "@mui/icons-material/Article";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import EventIcon from "@mui/icons-material/Event";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

const initialComponents = [
  { id: "textbox", content: "Text Field", label: "Label", showName: true, showLabel: true, icon: <TextFieldsIcon />, span: 6 },
  { id: "textarea", content: "Text Area", label: "Label", showName: true, showLabel: true, icon: <TextareaIcon />, span: 12 },
  { id: "checkbox", content: "Checkbox", label: "Label", showName: true, showLabel: true, icon: <CheckBoxIcon />, span: 4 },
  { id: "radio", content: "Radio Button", label: "Label", showName: true, showLabel: true, icon: <RadioButtonCheckedIcon />, span: 4 },
  { id: "dropdown", content: "Dropdown", label: "Label", showName: true, showLabel: true, icon: <ArrowDropDownCircleIcon />, options: ["Option 1", "Option 2"], span: 6 },
  { id: "multiselect", content: "Multi-select", label: "Label", showName: true, showLabel: true, icon: <FormatListBulletedIcon />, options: ["Option 1", "Option 2"], span: 12 },
  { id: "datepicker", content: "Date Picker", label: "Label", showName: true, showLabel: true, icon: <EventIcon />, span: 6 },
  { id: "switch", content: "Switch", label: "Label", showName: true, showLabel: true, icon: <ToggleOnIcon />, span: 4 },
];

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const FormBuilder = () => {
  const [formComponents, setFormComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      if (source.droppableId === "formArea") {
        const newComponents = Array.from(formComponents);
        newComponents.splice(source.index, 1);
        setFormComponents(newComponents);
      }
      return;
    }

    if (source.droppableId === "sidebar" && destination.droppableId === "formArea") {
      const draggedComponent = {
        ...initialComponents[source.index],
        id: `${initialComponents[source.index].id}-${Date.now()}`, // Ensure unique ID
      };

      const newComponents = Array.from(formComponents);
      newComponents.splice(destination.index, 0, draggedComponent);
      setFormComponents(newComponents);
    } else if (source.droppableId === "formArea") {
      const newComponents = reorder(formComponents, source.index, destination.index);
      setFormComponents(newComponents);
    }
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  const handleSaveChanges = () => {
    setFormComponents((prevComponents) =>
      prevComponents.map((comp) =>
        comp.id === selectedComponent.id ? selectedComponent : comp
      )
    );
    setSelectedComponent(null);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const renderFormComponent = (comp, index) => (
    <Draggable key={comp.id} draggableId={comp.id} index={index}>
      {(provided) => (
        <Grid
          item
          xs={12} sm={comp.span}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <MDBox
            mb={2}
            p={2}
            border={selectedComponent && selectedComponent.id === comp.id ? "2px solid #007bff" : "1px solid #ccc"}
            borderRadius="8px"
            backgroundColor="#f8f9fa"
            boxShadow={selectedComponent && selectedComponent.id === comp.id ? "0 0 10px 2px rgba(0, 123, 255, 0.5)" : "0 2px 4px rgba(0, 0, 0, 0.1)"}
            cursor="move"
            onClick={() => handleComponentClick(comp)}
            sx={{
              transition: "border 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {comp.showName && <Typography variant="h6" mb={1}>{comp.name}</Typography>}
            {comp.showLabel && !["checkbox", "radio", "switch"].some(type => comp.id.startsWith(type)) && (
              <Typography variant="subtitle1" mb={1}>{comp.label}</Typography>
            )}
            {comp.id.startsWith("textbox") && (
              <TextField fullWidth placeholder="Enter text" />
            )}
            {comp.id.startsWith("textarea") && (
              <TextField fullWidth multiline rows={4} placeholder="Enter detailed text" />
            )}
            {comp.id.startsWith("checkbox") && (
              <FormControlLabel control={<Checkbox />} label={comp.showLabel ? comp.label : ''} />
            )}
            {comp.id.startsWith("radio") && (
              <FormControlLabel control={<Radio />} label={comp.showLabel ? comp.label : ''} />
            )}
            {comp.id.startsWith("dropdown") && (
              <TextField select fullWidth>
                {comp.options.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {comp.id.startsWith("multiselect") && (
              <TextField select fullWidth SelectProps={{ multiple: true }}>
                {comp.options.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {comp.id.startsWith("datepicker") && (
              <MDDatePicker input={{ placeholder: "Select a date" }} />
            )}
            {comp.id.startsWith("switch") && (
              <FormControlLabel control={<Switch />} label={comp.showLabel ? comp.label : ''} />
            )}
          </MDBox>
        </Grid>
      )}
    </Draggable>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <MDBox p={2} component={Paper}>
                <Typography variant="h6" gutterBottom>
                  Components
                </Typography>
                <Droppable droppableId="sidebar" isDropDisabled={true}>
                  {(provided) => (
                    <MDBox
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      minHeight={400}
                    >
                      {initialComponents.map((comp, index) => (
                        <Draggable key={comp.id} draggableId={comp.id} index={index}>
                          {(provided) => (
                            <MDBox
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              mb={1.5}
                              p={1.5}
                              border="1px solid #ccc"
                              borderRadius="12px"
                              backgroundColor="#f1f1f1"
                              cursor="pointer"
                              textAlign="center"
                              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexDirection="column"
                            >
                              <MDBox
                                mb={1}
                                p={1}
                                borderRadius="50%"
                                backgroundColor="#f1f1f1"
                                color="black"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                {comp.icon}
                              </MDBox>
                              <Typography variant="subtitle2">{comp.content}</Typography>
                            </MDBox>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </MDBox>
                  )}
                </Droppable>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDBox p={2} component={Paper}>
                <Typography variant="h6" gutterBottom>
                  Build Your Form
                </Typography>
                <Droppable droppableId="formArea">
                  {(provided, snapshot) => (
                    <Grid
                      container
                      spacing={3}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      minHeight={400}
                      border="2px dashed #ccc"
                      borderRadius="8px"
                      p={2}
                      backgroundColor={snapshot.isDraggingOver ? 'lightblue' : '#fff'}
                    >
                      {formComponents.length === 0 && (
                        <Typography variant="body2" color="textSecondary" align="center">
                          Drag and drop components here
                        </Typography>
                      )}
                      {formComponents.map((comp, index) => renderFormComponent(comp, index))}
                      {provided.placeholder}
                    </Grid>
                  )}
                </Droppable>
              </MDBox>
              <MDBox mt={2} textAlign="center">
                <MDButton variant="contained" color="info" onClick={handlePreview}>
                  Preview Form
                </MDButton>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={3}>
              {selectedComponent && (
                <MDBox p={2} component={Paper}>
                  <Typography variant="h6" gutterBottom>
                    Edit Component
                  </Typography>
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={selectedComponent.name || ''}
                    onChange={(e) =>
                      setSelectedComponent({
                        ...selectedComponent,
                        name: e.target.value,
                      })
                    }
                  />
                  <TextField
                    label="Label"
                    fullWidth
                    margin="normal"
                    value={selectedComponent.label}
                    onChange={(e) =>
                      setSelectedComponent({
                        ...selectedComponent,
                        label: e.target.value,
                      })
                    }
                  />
                  <TextField
                    label="Column Span"
                    fullWidth
                    margin="normal"
                    select
                    value={selectedComponent.span}
                    onChange={(e) =>
                      setSelectedComponent({
                        ...selectedComponent,
                        span: parseInt(e.target.value, 10),
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                  {(selectedComponent.id.startsWith("dropdown") ||
                    selectedComponent.id.startsWith("multiselect")) && (
                    <TextField
                      label="Options (comma separated)"
                      fullWidth
                      margin="normal"
                      value={selectedComponent.options.join(", ")}
                      onChange={(e) =>
                        setSelectedComponent({
                          ...selectedComponent,
                          options: e.target.value.split(",").map(opt => opt.trim()),
                        })
                      }
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedComponent.showName || false}
                        onChange={(e) =>
                          setSelectedComponent({
                            ...selectedComponent,
                            showName: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Show Name"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedComponent.showLabel || false}
                        onChange={(e) =>
                          setSelectedComponent({
                            ...selectedComponent,
                            showLabel: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Show Label"
                  />
                  <MDButton
                    variant="contained"
                    color="primary"
                    onClick={handleSaveChanges}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Save Changes
                  </MDButton>
                </MDBox>
              )}
            </Grid>
          </Grid>
        </DragDropContext>
      </MDBox>
      {previewOpen && <FormPreview formComponents={formComponents} onClose={() => setPreviewOpen(false)} />}
      <Footer />
    </DashboardLayout>
  );
};

export default FormBuilder;
