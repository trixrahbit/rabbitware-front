import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const ConfirmationModal = ({ open, handleClose, details }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Typography variant="h6" mb={2}>
          Confirm Your Appointment
        </Typography>
        <Typography variant="body1" mb={1}>
          Name: {details.name}
        </Typography>
        <Typography variant="body1" mb={1}>
          Email: {details.email}
        </Typography>
        <Typography variant="body1" mb={1}>
          CC Email: {details.ccEmail}
        </Typography>
        <Typography variant="body1" mb={2}>
          Notes: {details.notes}
        </Typography>
        <Button fullWidth variant="contained" color="primary" onClick={handleClose}>
          Confirm
        </Button>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
