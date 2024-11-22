import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const AppointmentFormModal = ({ open, handleClose, selectedTime, bookingName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ccEmails, setCcEmails] = useState([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Selected Time:', selectedTime);
    console.log('Booking Name:', bookingName);
  }, [selectedTime, bookingName]);

  const validateInputs = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!email.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = 'Valid email is required.';
    }

    ccEmails.forEach((ccEmail, index) => {
      if (ccEmail && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ccEmail)) {
        newErrors[`ccEmail_${index}`] = `CC Email ${index + 1} is invalid.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleModalSave = async () => {
    if (!validateInputs()) {
        return;
    }

    // Extract the UUID from the current URL
    const meetingUUID = window.location.href.split('/').pop();

    const payload = {
        meeting_uuid: meetingUUID,
        visitor_name: name,
        visitor_email: email,
        cc_emails: ccEmails.join(','),  // Convert array of CC emails to a comma-separated string
        notes: notes,
        start_datetime: selectedTime,
        end_datetime: new Date(new Date(selectedTime).getTime() + 30 * 60000).toISOString(), // Assuming a 30-minute duration
    };

    console.log('Payload being sent:', payload);

    try {
        const response = await axios.post('http://localhost:8000/bookmeeting', payload);

    } catch (error) {
        console.error('Error booking meeting:', error); }

    handleModalClose();
};




  const handleModalClose = () => {
    setName('');
    setEmail('');
    setCcEmails([]);
    setNotes('');
    setErrors({});
    handleClose();
  };

  const handleAddGuest = () => {
    setCcEmails([...ccEmails, '']);
  };

  const handleCcEmailChange = (index, value) => {
    const updatedCcEmails = [...ccEmails];
    updatedCcEmails[index] = value;
    setCcEmails(updatedCcEmails);
  };

  const handleRemoveGuest = (index) => {
    const updatedCcEmails = ccEmails.filter((_, i) => i !== index);
    setCcEmails(updatedCcEmails);
  };

  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {bookingName ? bookingName : "Meeting"} - {selectedTime ? new Date(selectedTime).toLocaleString() : "No time selected"}
          </Typography>
          <IconButton onClick={handleModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          {ccEmails.length > 0 && ccEmails.map((ccEmail, index) => (
            <Grid item xs={12} key={index}>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  label={`CC Email ${index + 1}`}
                  value={ccEmail}
                  onChange={(e) => handleCcEmailChange(index, e.target.value)}
                  variant="outlined"
                  error={!!errors[`ccEmail_${index}`]}
                  helperText={errors[`ccEmail_${index}`]}
                />
                <IconButton onClick={() => handleRemoveGuest(index)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="text"
              onClick={handleAddGuest}
              sx={{ color: 'black', textTransform: 'none' }}
            >
              + Add Guests
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                color: 'white !important',
                backgroundColor: '#007bff',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#0056b3',
                  boxShadow: 'none',
                },
              }}
              onClick={handleModalSave}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AppointmentFormModal;
