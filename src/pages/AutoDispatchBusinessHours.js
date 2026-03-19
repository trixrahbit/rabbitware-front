import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  FormControlLabel, 
  Checkbox, 
  Alert, 
  Snackbar, 
  CircularProgress,
  TextField,
  FormGroup,
  Divider,
  Stack
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

export default function AutoDispatchBusinessHours() {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [days, setDays] = useState([0, 1, 2, 3, 4]); // Monday to Friday by default
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Day names for display
  const dayNames = [
    { id: 0, name: 'Monday' },
    { id: 1, name: 'Tuesday' },
    { id: 2, name: 'Wednesday' },
    { id: 3, name: 'Thursday' },
    { id: 4, name: 'Friday' },
    { id: 5, name: 'Saturday' },
    { id: 6, name: 'Sunday' }
  ];

  const fetchBusinessHours = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auto-dispatch/business-hours');
      
      // Set start time
      const startHours = res.data.start.split(':')[0];
      const startMinutes = res.data.start.split(':')[1];
      const newStartTime = new Date();
      newStartTime.setHours(parseInt(startHours, 10));
      newStartTime.setMinutes(parseInt(startMinutes, 10));
      setStartTime(newStartTime);
      
      // Set end time
      const endHours = res.data.end.split(':')[0];
      const endMinutes = res.data.end.split(':')[1];
      const newEndTime = new Date();
      newEndTime.setHours(parseInt(endHours, 10));
      newEndTime.setMinutes(parseInt(endMinutes, 10));
      setEndTime(newEndTime);
      
      // Set days
      setDays(res.data.days);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching business hours:', err);
      setError('Failed to load business hours. Using default values.');
      
      // Set default values
      const defaultStart = new Date();
      defaultStart.setHours(9, 0, 0);
      setStartTime(defaultStart);
      
      const defaultEnd = new Date();
      defaultEnd.setHours(17, 0, 0);
      setEndTime(defaultEnd);
      
      setDays([0, 1, 2, 3, 4]); // Monday to Friday
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessHours = async () => {
    if (!startTime || !endTime) {
      setError('Start time and end time are required');
      return;
    }
    
    if (days.length === 0) {
      setError('At least one day must be selected');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/auto-dispatch/business-hours', {
        start: `${startTime.getHours()}:${startTime.getMinutes()}`,
        end: `${endTime.getHours()}:${endTime.getMinutes()}`,
        days: days
      });
      
      setSuccess('Business hours saved successfully');
    } catch (err) {
      console.error('Error saving business hours:', err);
      setError('Failed to save business hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayId) => {
    if (days.includes(dayId)) {
      setDays(days.filter(d => d !== dayId));
    } else {
      setDays([...days, dayId].sort());
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Auto Dispatch Business Hours
        </Typography>
        
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configure Business Hours
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Business Hours
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TimePicker
                              label="Start Time"
                              value={startTime}
                              onChange={(newValue) => setStartTime(newValue)}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TimePicker
                              label="End Time"
                              value={endTime}
                              onChange={(newValue) => setEndTime(newValue)}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Business Days
                        </Typography>
                        <FormGroup row>
                          {dayNames.map((day) => (
                            <FormControlLabel
                              key={day.id}
                              control={
                                <Checkbox
                                  checked={days.includes(day.id)}
                                  onChange={() => handleDayToggle(day.id)}
                                />
                              }
                              label={day.name}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        onClick={saveBusinessHours}
                        disabled={loading || !startTime || !endTime || days.length === 0}
                        startIcon={<SaveIcon />}
                      >
                        Save Business Hours
                      </Button>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About Business Hours
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Why Configure Business Hours?
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Business hours define when Auto Dispatch rules that are configured to only run during business hours will be active.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Rules that are set to run only during business hours will not assign tickets outside of these hours, allowing for different handling during non-business hours.
                  </Typography>
                  <Typography variant="body2">
                    For 24/7 operations, you can select all days and set the hours from 00:00 to 23:59, or simply disable the "Active During Business Hours Only" option on your rules.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}