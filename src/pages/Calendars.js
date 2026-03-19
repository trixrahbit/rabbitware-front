import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Tooltip,
  Fade,
  Paper,
  Avatar,
  Chip,
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Switch,
  Radio,
  RadioGroup,
} from '@mui/material';
import WeatherForecast from '../components/WeatherForecast';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon, 
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import EventCalendar from '../components/EventCalendar';
import MDDatePicker from '../components/MDDatePicker';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Calendars() {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#1A73E8');
  const [userLocation, setUserLocation] = useState(null); // User's location for weather
  const [selected, setSelected] = useState('all'); // Default to 'all' view
  const [events, setEvents] = useState([]);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    color: null, // null means use calendar color
    start_datetime: new Date(),
    end_datetime: new Date(new Date().setHours(new Date().getHours() + 1)),
    isRecurring: false,
    recurrencePattern: 'weekly',
    daysOfWeek: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });
  const [selectedCalendar, setSelectedCalendar] = useState({ name: 'All Calendars', id: 'all' });

  // Cache for calendars and events
  const calendarsCache = useRef([]);
  const eventsCache = useRef({});  // Object to store events by calendar ID

  const loadCalendars = async (forceRefresh = false) => {
    // Use cached data if available and not forcing refresh
    if (calendarsCache.current.length > 0 && !forceRefresh) {
      console.log('Using cached calendars');
      setCalendars(calendarsCache.current);
      return;
    }

    // Otherwise fetch from API
    console.log('Fetching calendars from API');
    const res = await axios.get('/api/calendars');
    setCalendars(res.data);

    // Update cache
    calendarsCache.current = res.data;
  };

  const loadEvents = async (id, forceRefresh = false) => {
    if (id === 'all') {
      // For "All" view, check if we have all calendar events in cache
      const allCached = calendars.every(calendar => 
        eventsCache.current[calendar.id] !== undefined
      );

      if (allCached && !forceRefresh) {
        // Combine all cached events
        console.log('Using cached events for all calendars');
        let allEvents = [];
        for (const calendar of calendars) {
          const cachedEvents = eventsCache.current[calendar.id] || [];
          const eventsWithCalendar = cachedEvents.map(event => ({
            ...event,
            calendarName: calendar.name,
            calendarId: calendar.id,
            calendarColor: calendar.color
          }));
          allEvents = [...allEvents, ...eventsWithCalendar];
        }
        setEvents(allEvents);
      } else {
        // Fetch events for all calendars
        console.log('Fetching events for all calendars from API');
        let allEvents = [];
        for (const calendar of calendars) {
          const res = await axios.get(`/api/calendars/${calendar.id}/events`);
          // Cache the events for this calendar
          eventsCache.current[calendar.id] = res.data;

          // Add calendar information to each event for identification
          const eventsWithCalendar = res.data.map(event => ({
            ...event,
            calendarName: calendar.name,
            calendarId: calendar.id,
            calendarColor: calendar.color // Add calendar color for display in All view
          }));
          allEvents = [...allEvents, ...eventsWithCalendar];
        }
        setEvents(allEvents);
      }
      setSelectedCalendar({ name: 'All Calendars', id: 'all' });
    } else {
      // For specific calendar view, check if we have events in cache
      if (eventsCache.current[id] && !forceRefresh) {
        console.log(`Using cached events for calendar ${id}`);
        setEvents(eventsCache.current[id]);
      } else {
        // Fetch events for specific calendar
        console.log(`Fetching events for calendar ${id} from API`);
        const res = await axios.get(`/api/calendars/${id}/events`);
        setEvents(res.data);
        // Cache the events
        eventsCache.current[id] = res.data;
      }
      const calendar = calendars.find(cal => cal.id === id);
      setSelectedCalendar(calendar);
    }
  };

  // Load user location for weather forecast
  const loadUserLocation = async () => {
    try {
      // Use the current user from the component scope
      if (currentUser && currentUser.id) {
        // Fetch the user's profile to get their location
        const res = await axios.get(`/api/user_profiles/${currentUser.id}`);
        if (res.data && res.data.location) {
          setUserLocation(res.data.location);
        } else {
          console.log('No location set in user profile');
          setUserLocation(null);
        }
      } else {
        console.log('No current user found');
        setUserLocation(null);
      }
    } catch (error) {
      console.error('Failed to load user location:', error);
      setUserLocation(null);
    }
  };

  // Load calendars on initial render
  useEffect(() => {
    loadCalendars();
    loadUserLocation();
  }, []);

  // Load "All" view when calendars change
  useEffect(() => {
    if (calendars.length > 0 && selected === 'all') {
      loadEvents('all');
    }
  }, [calendars]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      calendarsCache.current = [];
      eventsCache.current = {};
    };
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await axios.post('/api/calendars', { name: newName, color: newColor });
    setNewName('');
    setNewColor('#1A73E8'); // Reset to default color
    setOpen(false);
    // Force refresh of calendars cache
    loadCalendars(true);
  };

  const handleDelete = async (id, event) => {
    if (event) event.stopPropagation();
    await axios.delete(`/api/calendars/${id}`);
    if (selected === id) {
      setSelected(null);
      setEvents([]);
      setSelectedCalendar(null);
    }
    // Force refresh of calendars cache
    loadCalendars(true);
    // Remove this calendar's events from the cache
    const updatedEventsCache = { ...eventsCache.current };
    delete updatedEventsCache[id];
    eventsCache.current = updatedEventsCache;
  };

  const handleAddEvent = async (event) => {
    if (!selected) return;

    // If it's a recurring event, include the recurring information
    const eventData = {
      ...event,
      // Only include recurring fields if isRecurring is true
      ...(event.isRecurring && {
        is_recurring: event.isRecurring,
        recurrence_pattern: event.recurrencePattern,
        days_of_week: event.daysOfWeek
      })
    };

    await axios.post(`/api/calendars/${selected}/events`, eventData);
    // Force refresh of events cache for this calendar
    loadEvents(selected, true);
    setAddEventOpen(false);
  };

  const handleUpdateEvent = async (id, event) => {
    await axios.put(`/api/calendars/events/${id}`, event);
    // Force refresh of events cache for this calendar
    loadEvents(selected, true);
  };

  const handleDeleteEvent = async (id) => {
    await axios.delete(`/api/calendars/events/${id}`);
    // Force refresh of events cache for this calendar
    loadEvents(selected, true);
  };

  const handleCloseCalendar = () => {
    setSelected(null);
    setEvents([]);
    setSelectedCalendar(null);
  };

  const handleAddEventSubmit = () => {
    if (!newEvent.title.trim()) return;
    handleAddEvent(newEvent);
    setNewEvent({
      title: '',
      color: null, // Reset to use calendar color
      start_datetime: new Date(),
      end_datetime: new Date(new Date().setHours(new Date().getHours() + 1)),
      isRecurring: false,
      recurrencePattern: 'weekly',
      daysOfWeek: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    });
  };

  const handleCalendarAddEventClick = (date) => {
    setNewEvent({
      ...newEvent,
      start_datetime: date,
      end_datetime: new Date(new Date(date).setHours(new Date(date).getHours() + 1))
    });
    setAddEventOpen(true);
  };

  const getRandomColor = (id) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'];
    return colors[id % colors.length];
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_datetime) > now)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: darkMode ? 'background.default' : '#f8f9fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Header - Weather Forecast */}
        <Grid item xs={12}>
          <Card 
            elevation={3}
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              background: darkMode ? 'linear-gradient(195deg, #42424a, #191919)' : 'linear-gradient(195deg, #49a3f1, #1A73E8)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14)'
            }}
          >
            <CardContent>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Typography variant="h4" fontWeight="medium" color="white">
                    Weather Forecast
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Set your location in your profile to see weather in your area
                  </Typography>
                </Grid>
                <Grid item>
                  <WeatherForecast location={userLocation} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Calendar List */}
        <Grid item xs={12} md={3} lg={2}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                  Calendars
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
                  size="small"
                  fullWidth
                  sx={{ 
                    bgcolor: darkMode ? 'primary.main' : 'primary.main',
                    '&:hover': {
                      bgcolor: darkMode ? 'primary.dark' : 'primary.dark',
                    }
                  }}
                >
                  New Calendar
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {calendars.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No calendars found. Create your first calendar!
                </Typography>
              ) : (
                <List sx={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                  }
                }}>
                  {/* All Calendars option */}
                  <Fade in={true} timeout={500}>
                    <ListItem
                      button
                      sx={{
                        mb: 1,
                        borderRadius: '8px',
                        bgcolor: selected === 'all' ? (darkMode ? 'rgba(26, 115, 232, 0.1)' : 'rgba(26, 115, 232, 0.1)') : 'transparent',
                        border: selected === 'all' ? '1px solid rgba(26, 115, 232, 0.5)' : '1px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(26, 115, 232, 0.05)' : 'rgba(26, 115, 232, 0.05)',
                        }
                      }}
                      onClick={() => {
                        setSelected('all');
                        loadEvents('all');
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#1A73E8',
                            width: 36,
                            height: 36
                          }}
                        >
                          <CalendarIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary="All Calendars" 
                        primaryTypographyProps={{ 
                          fontWeight: selected === 'all' ? 'medium' : 'regular'
                        }}
                      />
                    </ListItem>
                  </Fade>

                  <Divider sx={{ my: 1 }} />

                  {calendars.map((cal) => (
                    <Fade in={true} key={cal.id} timeout={500}>
                      <ListItem
                        button
                        sx={{
                          mb: 1,
                          borderRadius: '8px',
                          bgcolor: selected === cal.id ? (darkMode ? 'rgba(26, 115, 232, 0.1)' : 'rgba(26, 115, 232, 0.1)') : 'transparent',
                          border: selected === cal.id ? '1px solid rgba(26, 115, 232, 0.5)' : '1px solid transparent',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: darkMode ? 'rgba(26, 115, 232, 0.05)' : 'rgba(26, 115, 232, 0.05)',
                          }
                        }}
                        onClick={() => {
                          setSelected(cal.id);
                          loadEvents(cal.id);
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: cal.color || getRandomColor(cal.id),
                              width: 36,
                              height: 36
                            }}
                          >
                            <CalendarIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={cal.name} 
                          primaryTypographyProps={{ 
                            fontWeight: selected === cal.id ? 'medium' : 'regular'
                          }}
                        />
                        <Tooltip title="Delete Calendar" arrow>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => handleDelete(cal.id, e)}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'error.main',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Calendar Content */}
        <Grid item xs={12} md={9} lg={10}>
          {selected ? (
            <Fade in={true} timeout={500}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: selected === 'all' ? '#1A73E8' : (selectedCalendar?.color || getRandomColor(selected)),
                          mr: 2
                        }}
                      >
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="medium">
                          {selectedCalendar?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {events.length} events {selected === 'all' ? 'from all calendars' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      {selected !== 'all' ? (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setAddEventOpen(true)}
                          sx={{ mr: 1 }}
                        >
                          Add Event
                        </Button>
                      ) : (
                        <Tooltip title="Select a specific calendar to add events" arrow>
                          <span>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              disabled
                              sx={{ mr: 1 }}
                            >
                              Add Event
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                      <IconButton onClick={handleCloseCalendar}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Calendar */}
                    <Grid item xs={12} lg={8}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        }}
                      >
                        <EventCalendar
                          events={events}
                          onAdd={handleAddEvent}
                          onUpdate={handleUpdateEvent}
                          onDelete={handleDeleteEvent}
                          onAddEventClick={handleCalendarAddEventClick}
                          isAllView={selected === 'all'}
                        />
                      </Paper>
                    </Grid>

                    {/* Upcoming Events */}
                    <Grid item xs={12} lg={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: '12px',
                          height: '100%',
                          border: '1px solid',
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                          Upcoming Events
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {getUpcomingEvents().length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No upcoming events
                          </Typography>
                        ) : (
                          <List>
                            {getUpcomingEvents().map((event) => (
                              <ListItem 
                                key={event.id}
                                sx={{ 
                                  px: 1, 
                                  py: 1.5,
                                  borderRadius: '8px',
                                  mb: 1,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: '40px' }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      bgcolor: selected === 'all' 
                                        ? (event.calendarColor || getRandomColor(event.calendarId || event.id))
                                        : (event.color || getRandomColor(event.id))
                                    }}
                                  >
                                    <EventIcon fontSize="small" />
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                      {event.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatEventDate(event.start_datetime)}
                                      </Typography>
                                      {selected === 'all' && event.calendarName && (
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            display: 'block',
                                            color: 'primary.main',
                                            mt: 0.5
                                          }}
                                        >
                                          {event.calendarName}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                                <Tooltip title="Delete Event" arrow>
                                  <IconButton 
                                    edge="end" 
                                    size="small"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    sx={{ 
                                      color: 'text.secondary',
                                      '&:hover': {
                                        color: 'error.main',
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          ) : (
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '12px',
                minHeight: '400px',
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: '1px dashed',
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              <Box textAlign="center" p={3}>
                <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Calendar Selected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
                  Select a calendar from the list (including the "All Calendars" option) or create a new one to view and manage your events.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
                >
                  Create New Calendar
                </Button>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* New Calendar Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="medium">
            Create New Calendar
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a name and select a color for your new calendar
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Calendar Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            variant="outlined"
            sx={{ mt: 1, mb: 3 }}
          />

          <FormLabel component="legend" sx={{ mb: 1 }}>Calendar Color</FormLabel>
          <RadioGroup
            row
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
          >
            {['#1A73E8', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'].map((color) => (
              <FormControlLabel
                key={color}
                value={color}
                control={
                  <Radio 
                    sx={{
                      color: color,
                      '&.Mui-checked': {
                        color: color,
                      }
                    }}
                  />
                }
                label=""
                sx={{
                  m: 0,
                  '& .MuiRadio-root': {
                    p: 0.5,
                  },
                  '& .MuiFormControlLabel-label': {
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: color,
                    ml: 0.5
                  }
                }}
              />
            ))}
          </RadioGroup>
          <Box 
            sx={{ 
              width: '100%', 
              height: 40, 
              backgroundColor: newColor,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" color="white">
              Preview
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            variant="contained"
            disabled={!newName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog 
        open={addEventOpen} 
        onClose={() => setAddEventOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="medium">
            Add New Event
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new event for {selectedCalendar?.name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Start Date & Time
          </Typography>
          <MDDatePicker
            options={{ 
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              time_24hr: false
            }}
            value={newEvent.start_datetime}
            onChange={(dates) => setNewEvent({...newEvent, start_datetime: dates[0]})}
            input={{
              fullWidth: true,
              variant: "outlined",
              sx: { mb: 2 }
            }}
          />
          <Typography variant="body2" sx={{ mb: 1 }}>
            End Date & Time
          </Typography>
          <MDDatePicker
            options={{ 
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              time_24hr: false
            }}
            value={newEvent.end_datetime}
            onChange={(dates) => setNewEvent({...newEvent, end_datetime: dates[0]})}
            input={{
              fullWidth: true,
              variant: "outlined",
              sx: { mb: 2 }
            }}
          />

          <FormLabel component="legend" sx={{ mb: 1 }}>Event Color (Optional)</FormLabel>
          <RadioGroup
            row
            value={newEvent.color || ""}
            onChange={(e) => setNewEvent({...newEvent, color: e.target.value === "inherit" ? null : e.target.value})}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
          >
            <FormControlLabel
              value="inherit"
              control={<Radio />}
              label="Use Calendar Color"
              sx={{ mr: 2 }}
            />
            {['#1A73E8', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'].map((color) => (
              <FormControlLabel
                key={color}
                value={color}
                control={
                  <Radio 
                    sx={{
                      color: color,
                      '&.Mui-checked': {
                        color: color,
                      }
                    }}
                  />
                }
                label=""
                sx={{
                  m: 0,
                  '& .MuiRadio-root': {
                    p: 0.5,
                  },
                  '& .MuiFormControlLabel-label': {
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: color,
                    ml: 0.5
                  }
                }}
              />
            ))}
          </RadioGroup>

          <FormControlLabel
            control={
              <Switch
                checked={newEvent.isRecurring}
                onChange={(e) => setNewEvent({...newEvent, isRecurring: e.target.checked})}
                color="primary"
              />
            }
            label="Recurring Event"
            sx={{ mb: 2 }}
          />

          {newEvent.isRecurring && (
            <>
              <FormLabel component="legend" sx={{ mb: 1 }}>Repeat on days:</FormLabel>
              <FormGroup row sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.monday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, monday: e.target.checked}
                      })}
                    />
                  }
                  label="Mon"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.tuesday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, tuesday: e.target.checked}
                      })}
                    />
                  }
                  label="Tue"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.wednesday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, wednesday: e.target.checked}
                      })}
                    />
                  }
                  label="Wed"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.thursday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, thursday: e.target.checked}
                      })}
                    />
                  }
                  label="Thu"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.friday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, friday: e.target.checked}
                      })}
                    />
                  }
                  label="Fri"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.saturday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, saturday: e.target.checked}
                      })}
                    />
                  }
                  label="Sat"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newEvent.daysOfWeek.sunday}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        daysOfWeek: {...newEvent.daysOfWeek, sunday: e.target.checked}
                      })}
                    />
                  }
                  label="Sun"
                />
              </FormGroup>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setAddEventOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddEventSubmit}
            variant="contained"
            disabled={!newEvent.title.trim()}
          >
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
