import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Grid,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import MDBox from "../../../../../../components/MDBox";
import MDButton from "../../../../../../components/MDButton";
import MDTypography from "../../../../../../components/MDTypography";
import axios from "axios";
import { useAuth } from "../../../../../../context/AuthContext";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ITEM_TYPE = "SERVICE";

// Draggable service component with green accents.
const DraggableService = ({ service, fromList }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { service, fromList },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  return (
    <Box
      ref={drag}
      sx={{
        padding: "10px",
        marginBottom: "8px",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "8px",
        backgroundColor: isDragging ? "rgba(200,230,201,0.8)" : "rgba(232,245,233,0.8)",
        cursor: "grab",
        boxShadow: isDragging ? "0px 4px 8px rgba(0,0,0,0.1)" : "none",
        transition: "background-color 0.2s",
      }}
    >
      <Typography variant="body2" sx={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
        {service.service_name}
      </Typography>
    </Box>
  );
};

// Droppable container component with a glass-like style.
const DroppableContainer = ({ droppableId, title, items, onDropItem }) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (draggedItem) => {
        onDropItem(draggedItem, droppableId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [droppableId, onDropItem]
  );

  return (
    <Box
      ref={drop}
      sx={{
        minHeight: "200px",
        border: "2px dashed rgba(56,142,60,0.7)",
        padding: "12px",
        borderRadius: "12px",
        backgroundColor: isOver ? "rgba(220,237,200,0.7)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        transition: "background-color 0.2s",
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold", color: "#1b5e20" }}>
        {title}
      </Typography>
      {items.length > 0 ? (
        items.map((service) => (
          <DraggableService key={service.id} service={service} fromList={droppableId} />
        ))
      ) : (
        <Typography variant="body2" sx={{ fontStyle: "italic", color: "#555" }}>
          {droppableId === "available" ? "No services available" : "Drag services here"}
        </Typography>
      )}
    </Box>
  );
};

const NewContractServiceBundleModal = ({ open, onClose, onBundleCreated }) => {
  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    bundle_name: "",
    price: "",
    cost: "",
    // Note: Removed start_date, end_date, and services fields.
  });

  // State for available and selected services.
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Fetch available services.
  useEffect(() => {
    if (!authToken) return;
    axios
      .get("https://app.webitservices.com/api/services", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        console.log("Fetched available services:", res.data);
        setAvailableServices(res.data || []);
      })
      .catch((err) => console.error("Error fetching available services", err));
  }, [authToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle drop event: move items between available and selected lists.
  const onDropItem = useCallback((draggedItem, targetDroppableId) => {
    if (draggedItem.fromList === targetDroppableId) return;
    if (draggedItem.fromList === "available" && targetDroppableId === "selected") {
      setAvailableServices(prev => prev.filter(s => s.id !== draggedItem.service.id));
      setSelectedServices(prev => [...prev, draggedItem.service]);
    } else if (draggedItem.fromList === "selected" && targetDroppableId === "available") {
      setSelectedServices(prev => prev.filter(s => s.id !== draggedItem.service.id));
      setAvailableServices(prev => [...prev, draggedItem.service]);
    }
  }, []);

  const handleCreateBundle = async () => {
    // Check required fields.
    if (!formData.bundle_name) {
      console.error("Bundle Name is required");
      return;
    }
    const payload = {
      bundle_name: formData.bundle_name,
      price: formData.price ? parseFloat(formData.price) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      // Do not include services in payload since they are handled separately.
    };

    console.log("Creating service bundle with payload:", payload);
    try {
      const response = await axios.post(
        "https://app.webitservices.com/api/service-bundles",
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("Service Bundle created successfully", response.data);
      // If you wish to assign the selected services to the bundle,
      // you can loop over selectedServices and call the appropriate endpoint here.
      onBundleCreated && onBundleCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating service bundle:", error.response?.data || error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems:"center", justifyContent:"center" }}
    >
      <DndProvider backend={HTML5Backend}>
        <MDBox
          sx={{
            width: "650px",
            bgcolor: "#4CAF50", // Base green color.
            backgroundImage: "url('https://via.placeholder.com/800x600?text=Galaxy+Background')", // Replace with a real galaxy background image.
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            borderRadius: "16px",
            p: 4,
            boxShadow: "0px 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <MDTypography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color="#F1F8E9"
            mb={3}
            sx={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
          >
            New Service Bundle
          </MDTypography>
          <Grid container spacing={2}>
            {/* Left Column: Bundle Details */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bundle Name"
                name="bundle_name"
                value={formData.bundle_name}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: "#F1F8E9" } }}
                sx={{
                  input: { color: "#F1F8E9" },
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                }}
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: "#F1F8E9" } }}
                sx={{
                  input: { color: "#F1F8E9" },
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                }}
              />
              <TextField
                fullWidth
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: "#F1F8E9" } }}
                sx={{
                  input: { color: "#F1F8E9" },
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                }}
              />
            </Grid>
            {/* Right Column: Drag & Drop Section */}
            <Grid item xs={6}>
              <MDTypography variant="h6" gutterBottom sx={{ color: "#F1F8E9" }}>
                Available & Selected Services
              </MDTypography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <DroppableContainer
                  droppableId="available"
                  title="Available"
                  items={availableServices}
                  onDropItem={onDropItem}
                />
                <DroppableContainer
                  droppableId="selected"
                  title="Selected"
                  items={selectedServices}
                  onDropItem={onDropItem}
                />
              </Box>
            </Grid>
          </Grid>
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton
              variant="contained"
              color="success"
              onClick={handleCreateBundle}
              sx={{ mr: 2, backgroundColor: "#8BC34A" }}
            >
              Create Bundle
            </MDButton>
            <MDButton
              variant="outlined"
              color="error"
              onClick={onClose}
              sx={{ borderColor: "#D32F2F", color: "#D32F2F" }}
            >
              Cancel
            </MDButton>
          </MDBox>
        </MDBox>
      </DndProvider>
    </Modal>
  );
};

export default NewContractServiceBundleModal;
