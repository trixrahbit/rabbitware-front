import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Card, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/system";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Delete as DeleteIcon } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";

// Styled component for strikethrough
const CompletedText = styled(Typography)(({ theme }) => ({
  textDecoration: "line-through",
  color: theme.palette.text.secondary,
}));

const ChecklistData = ({
  itemType,
  itemId,
  enableCheckbox = true,
  enableDragDrop = false,
  enableDelete = false,
  inlineEdit = false,
  enableChecklistNameEdit = false,  // New prop to enable name editing
}) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        let response;
        if (itemType === "tasks") {
          response = await axios.get(`https://app.webitservices.com/api/checklists/task/${itemId}`);
        } else if (itemType === "stories") {
          response = await axios.get(`https://app.webitservices.com/api/checklists/story/${itemId}`);
        }

        if (response && response.data) {
          setChecklists(response.data);
        }
      } catch (error) {
        console.error("Error fetching checklists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, [itemType, itemId]);

  const handleCheckboxChange = async (checklistId, itemId, checked) => {
    try {
      const updatedChecklists = checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId
                  ? { ...item, completed: checked, completedBy: "current_user", completedAt: new Date().toLocaleString() }
                  : item
              ),
            }
          : checklist
      );

      setChecklists(updatedChecklists);

      await axios.put(`https://app.webitservices.com/api/checklists/${checklistId}/items/${itemId}`, {
        completed: checked,
        completedBy: "current_user",
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating checklist item:", error);
    }
  };

  const handleDeleteItem = async (checklistId, itemId) => {
    try {
      await axios.delete(`https://app.webitservices.com/api/checklists/${checklistId}/items/${itemId}`);
      const updatedChecklists = checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.filter(item => item.id !== itemId)
            }
          : checklist
      );
      setChecklists(updatedChecklists);
    } catch (error) {
      console.error("Error deleting checklist item:", error);
    }
  };

  const handleItemEdit = async (checklistId, itemId, description) => {
    try {
      const updatedChecklists = checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId
                  ? { ...item, description }
                  : item
              ),
            }
          : checklist
      );

      setChecklists(updatedChecklists);

      await axios.put(`https://app.webitservices.com/api/checklists/${checklistId}/items/${itemId}`, {
        description,
      });
    } catch (error) {
      console.error("Error editing checklist item:", error);
    }
  };

  const handleDragEnd = async (result, checklistId) => {
    if (!result.destination) return;

    const checklistIndex = checklists.findIndex(checklist => checklist.id === checklistId);
    const reorderedItems = Array.from(checklists[checklistIndex].items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    const updatedChecklists = [...checklists];
    updatedChecklists[checklistIndex].items = reorderedItems;
    setChecklists(updatedChecklists);

    try {
      await axios.put(`https://app.webitservices.com/api/checklists/${checklistId}/reorder`, {
        items: reorderedItems.map((item, index) => ({ id: item.id, order: index })),
      });
    } catch (error) {
      console.error("Error saving item order:", error);
    }
  };

  const handleChecklistNameEdit = async (checklistId, newName) => {
    try {
      const updatedChecklists = checklists.map(checklist =>
        checklist.id === checklistId
          ? { ...checklist, name: newName }
          : checklist
      );
      setChecklists(updatedChecklists);

      await axios.put(`https://app.webitservices.com/api/checklists/${checklistId}`, {
        name: newName,
      });
    } catch (error) {
      console.error("Error updating checklist name:", error);
    }
  };

  if (loading) {
    return <Typography>Loading checklists...</Typography>;
  }

  if (checklists.length === 0) {
    return <Typography>No checklists available.</Typography>;
  }

  return (
    <>
      {checklists.map((checklist) => (
        <Card key={checklist.id} sx={{ mb: 2, p: 3 }}>
          {enableChecklistNameEdit ? (
            <TextField
              variant="standard"
              value={checklist.name || `Checklist #${checklist.id}`}
              onChange={(e) => handleChecklistNameEdit(checklist.id, e.target.value)}
              fullWidth
            />
          ) : (
            <Typography variant="h6">{checklist.name || `Checklist #${checklist.id}`}</Typography>
          )}
          {enableDragDrop ? (
            <DragDropContext onDragEnd={(result) => handleDragEnd(result, checklist.id)}>
              <Droppable droppableId={`checklist-${checklist.id}`}>
                {(provided) => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    {checklist.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={`item-${item.id}`} index={index}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            display="flex"
                            alignItems="center"
                            mb={1}
                          >
                            {enableCheckbox && (
                              <Checkbox
                                checked={item.completed}
                                onChange={(e) => handleCheckboxChange(checklist.id, item.id, e.target.checked)}
                              />
                            )}
                            {inlineEdit ? (
                              <TextField
                                variant="standard"
                                value={item.description}
                                onChange={(e) => handleItemEdit(checklist.id, item.id, e.target.value)}
                                sx={{ flexGrow: 1 }}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                {item.completed ? (
                                  <CompletedText>
                                    {item.description} - Completed by {item.completedBy} at {item.completedAt}
                                  </CompletedText>
                                ) : (
                                  item.description
                                )}
                              </Typography>
                            )}
                            {enableDelete && (
                              <IconButton onClick={() => handleDeleteItem(checklist.id, item.id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            checklist.items.map((item) => (
              <Box
                key={item.id}
                display="flex"
                alignItems="center"
                mb={1}
              >
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {item.completed ? (
                    <CompletedText>
                      {item.description} - Completed by {item.completedBy} at {item.completedAt}
                    </CompletedText>
                  ) : (
                    item.description
                  )}
                </Typography>
              </Box>
            ))
          )}
        </Card>
      ))}
    </>
  );
};

export default ChecklistData;
