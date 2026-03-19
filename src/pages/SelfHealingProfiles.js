import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  List,
  ListItemButton,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

export default function SelfHealingProfiles() {
  const [companies, setCompanies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [profileItems, setProfileItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchProfiles();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies/all');
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/self-healing/profiles');
      setProfiles(response.data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setProfiles([]);
    }
  };

  const fetchAvailableOptions = async (companyId) => {
    try {
      const response = await axios.get(`/api/self-healing/profiles/company/${companyId}/options`);
      const opts = [];
      Object.values(response.data || {}).forEach((arr) => {
        if (Array.isArray(arr)) opts.push(...arr);
      });
      setAvailableOptions(opts);
    } catch (error) {
      console.error('Error fetching options:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setAvailableOptions([]);
    }
  };
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedProfile(null);
    setProfileItems([]);
    fetchAvailableOptions(company.id);
    // Filter available options by company devices (placeholder data)
    setAvailableOptions(["App A", "App B", "Service X", "Service Y"]);
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setProfileItems(profile.configuration?.items || []);
  };

  const handleOpenDialog = (profile = null) => {
    if (profile) {
      handleProfileSelect(profile);
    } else {
      setSelectedProfile(null);
      setProfileItems([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    setProfileItems((prev) => [...prev, item]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveProfile = async () => {
    const payload = {
      name: selectedProfile ? selectedProfile.name : 'New Profile',
      description: selectedProfile ? selectedProfile.description : '',
      profile_type: 'company',
      company_id: selectedCompany?.id,
      configuration: { items: profileItems },
      is_active: true,
    };
    try {
      if (selectedProfile) {
        await axios.put(`/api/self-healing/profiles/${selectedProfile.id}`, payload);
      } else {
        await axios.post('/api/self-healing/profiles', payload);
      }
      fetchProfiles();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  const companyProfiles = profiles.filter(
    (p) => p.company_id === selectedCompany?.id
  );

  if (accessError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: 'grey.100' }}>
        <Typography variant="h6">{accessError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Self Healing Profiles
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Companies
            </Typography>
            <List>
              {companies.map((company) => (
                <ListItemButton
                  key={company.id}
                  selected={selectedCompany?.id === company.id}
                  onClick={() => handleCompanySelect(company)}
                >
                  {company.CompanyName}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedCompany ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Profiles for {selectedCompany.CompanyName}
                </Typography>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                  New Profile
                </Button>
              </Box>
              <List>
                {companyProfiles.map((profile) => (
                  <ListItemButton
                    key={profile.id}
                    onClick={() => handleOpenDialog(profile)}
                  >
                    {profile.name}
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography variant="body1">Select a company to view profiles.</Typography>
          )}
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProfile ? 'Edit Profile' : 'Create Profile'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Available Options</Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
                {availableOptions.map((opt, idx) => (
                  <Box
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opt)}
                    sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, mb: 1, cursor: 'grab' }}
                  >
                    {opt}
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Profile Items</Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, minHeight: 200 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {profileItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Drag items here
                  </Typography>
                ) : (
                  profileItems.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, mb: 1 }}>
                      {item}
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
