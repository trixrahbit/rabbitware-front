import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddProjectModal from "./AddProjectModal"; // Adjust the import path as needed

const AddProjectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Tooltip title="Add Project" placement="right">
        <IconButton
          onClick={() => setIsModalOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "info.main",
            "&:hover": { backgroundColor: "info.dark" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
      <AddProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(projectData) => {
          // handle project save
        }}
      />
    </>
  );
};

export default AddProjectButton;
