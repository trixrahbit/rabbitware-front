import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import useTimezone from '../hooks/useTimezone';

/**
 * Example component demonstrating how to use the useTimezone hook
 * to display dates and times in the user's selected timezone
 */
const TimezoneExample = () => {
  const { formatDate, getCurrentDate, timezone } = useTimezone();
  const [currentTime, setCurrentTime] = useState('');
  
  // Update the current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentDate('yyyy-MM-dd HH:mm:ss'));
    };
    
    // Update immediately
    updateTime();
    
    // Set up interval to update every second
    const interval = setInterval(updateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [getCurrentDate]);
  
  // Example dates to format
  const exampleDates = [
    new Date(), // Current date
    new Date('2023-01-01T00:00:00Z'), // New Year's Day
    new Date('2023-07-04T16:00:00Z'), // July 4th
    new Date('2023-12-25T12:00:00Z'), // Christmas
  ];
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Timezone Example
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Current Timezone: <strong>{timezone}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Current Time: <strong>{currentTime}</strong>
        </Typography>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Example Date Formatting
      </Typography>
      
      <Grid container spacing={2}>
        {exampleDates.map((date, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                UTC Date:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {date.toISOString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Formatted in {timezone}:
              </Typography>
              <Typography variant="body1">
                {formatDate(date, 'yyyy-MM-dd HH:mm:ss')}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Alternative Format:
              </Typography>
              <Typography variant="body1">
                {formatDate(date, 'MMMM do, yyyy h:mm a')}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TimezoneExample;