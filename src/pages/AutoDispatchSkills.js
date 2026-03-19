import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  IconButton, 
  Divider,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function AutoDispatchSkills() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auto-dispatch/skills');
      setSkills(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createSkill = async () => {
    if (!newSkill) return;

    setLoading(true);
    try {
      await axios.post('/api/auto-dispatch/skills', { name: newSkill });
      setNewSkill('');
      fetchSkills();
      setSuccess('Skill added successfully');
    } catch (err) {
      console.error('Error creating skill:', err);
      setError('Failed to add skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createSkill();
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Auto Dispatch Skills
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
                Add New Skill
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField 
                  label="Skill Name" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter skill name"
                  disabled={loading}
                />
                <Button 
                  variant="contained" 
                  onClick={createSkill} 
                  sx={{ ml: 2 }}
                  disabled={!newSkill || loading}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Skills are used to match tickets with the appropriate resources based on their expertise.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Existing Skills
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {skills.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No skills found. Add your first skill above.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {skills.map((skill) => (
                      <React.Fragment key={skill.id}>
                        <ListItem
                          secondaryAction={
                            <Chip 
                              label={`ID: ${skill.id}`} 
                              size="small" 
                              variant="outlined"
                            />
                          }
                        >
                          <ListItemText 
                            primary={skill.name} 
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
