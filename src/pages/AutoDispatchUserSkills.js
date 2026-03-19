import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  Divider, 
  Chip, 
  Alert, 
  Snackbar, 
  CircularProgress, 
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function AutoDispatchUserSkills() {
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all skills
      const skillsRes = await axios.get('/api/auto-dispatch/skills');
      setSkills(skillsRes.data);
      
      // Fetch all users with their skills
      const usersRes = await axios.get('/api/auto-dispatch/users-skills');
      setUsers(usersRes.data.users);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const assignSkill = async () => {
    if (!selectedUser || !selectedSkill) {
      setError('Both user and skill must be selected');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`/api/auto-dispatch/users/${selectedUser.id}/skills`, {
        skill_id: selectedSkill.id
      });
      
      setSuccess(`Skill "${selectedSkill.name}" assigned to ${selectedUser.name}`);
      setSelectedSkill(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error assigning skill:', err);
      setError('Failed to assign skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (userId, skillId, skillName, userName) => {
    setLoading(true);
    try {
      await axios.delete(`/api/auto-dispatch/users/${userId}/skills/${skillId}`);
      setSuccess(`Skill "${skillName}" removed from ${userName}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error removing skill:', err);
      setError('Failed to remove skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Autotask User Skills
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
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assign Skills to Users
              </Typography>
              
              {loading && !users.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedUser}
                    onChange={(event, newValue) => {
                      setSelectedUser(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select User" variant="outlined" />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          {option.name}
                        </Box>
                      </li>
                    )}
                  />
                  
                  <Autocomplete
                    options={skills}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedSkill}
                    onChange={(event, newValue) => {
                      setSelectedSkill(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Skill" variant="outlined" />
                    )}
                    disabled={!selectedUser}
                  />
                  
                  <Button 
                    variant="contained" 
                    onClick={assignSkill}
                    disabled={loading || !selectedUser || !selectedSkill}
                    startIcon={<AddIcon />}
                  >
                    Assign Skill
                  </Button>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Assign skills to Autotask users to enable proper routing in Auto Dispatch.
                    The system will match ticket requirements with user skills to find the best resource.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Skills
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {loading && users.length > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : users.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No users found. Please check your Autotask integration.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {users.map((user) => (
                      <React.Fragment key={user.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="subtitle1">
                                  {user.name}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                {user.skills.length > 0 ? (
                                  user.skills.map((skill) => (
                                    <Chip
                                      key={skill.id}
                                      label={skill.name}
                                      size="small"
                                      onDelete={() => removeSkill(user.id, skill.id, skill.name, user.name)}
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    No skills assigned
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}