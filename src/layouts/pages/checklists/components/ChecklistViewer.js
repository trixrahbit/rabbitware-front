import React from "react";
import { Box, Modal, Button } from "@mui/material";
import ChecklistData from "./ChecklistData";

const ChecklistViewer = ({ open = false, onClose, itemType, itemId }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          maxHeight: "80vh",
          overflowY: "auto",
          backgroundColor: "background.paper",
          boxShadow: 24,
          padding: 4,
          borderRadius: 2,
        }}
      >
        <ChecklistData
          itemType={itemType}
          itemId={itemId}
          enableCheckbox={true}
          enableDragDrop={false}
          enableDelete={false}
          inlineEdit={false}
        />
        <Button onClick={onClose} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ChecklistViewer;
