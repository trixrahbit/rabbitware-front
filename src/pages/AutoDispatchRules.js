import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

export default function AutoDispatchRules() {
  const [rules, setRules] = useState([]);
  const [queue, setQueue] = useState('');
  const [queueId, setQueueId] = useState(null);
  const [status, setStatus] = useState('');
  const [statusId, setStatusId] = useState(null);
  const [method, setMethod] = useState('round_robin');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeDuringBusinessHours, setActiveDuringBusinessHours] = useState(true);
  const [issueType, setIssueType] = useState('');
  const [issueTypeId, setIssueTypeId] = useState(null);
  const [subIssueType, setSubIssueType] = useState('');
  const [subIssueTypeId, setSubIssueTypeId] = useState(null);
  const [company, setCompany] = useState('');
  const [companyId, setCompanyId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data from Autotask
  const [queues, setQueues] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [subIssueTypes, setSubIssueTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingAutotask, setLoadingAutotask] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auto-dispatch/rules');
      setRules(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('Failed to load rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutotaskData = async () => {
    setLoadingAutotask(true);
    try {
      // Fetch queues from Autotask
      const queuesRes = await axios.get('/api/auto-dispatch/autotask/queues');
      setQueues(queuesRes.data);

      // Fetch statuses from Autotask
      const statusesRes = await axios.get('/api/auto-dispatch/autotask/statuses');
      setStatuses(statusesRes.data);

      // Fetch skills
      const skillsRes = await axios.get('/api/auto-dispatch/skills');
      setSkills(skillsRes.data);

      // Fetch issue types
      const issueTypesRes = await axios.get('/api/auto-dispatch/autotask/issue-types');
      setIssueTypes(issueTypesRes.data);

      // Fetch sub-issue types (all initially)
      const subIssueTypesRes = await axios.get('/api/auto-dispatch/autotask/sub-issue-types');
      setSubIssueTypes(subIssueTypesRes.data);

      // Fetch companies
      const companiesRes = await axios.get('/api/auto-dispatch/companies');
      setCompanies(companiesRes.data);

    } catch (err) {
      console.error('Error fetching Autotask data:', err);
      setError('Failed to load data from Autotask. Please try again.');
    } finally {
      setLoadingAutotask(false);
    }
  };

  const createRule = async () => {
    if (!queue || !status) {
      setError('Queue and Status are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auto-dispatch/rules', {
        queue,
        status,
        method,
        skills: selectedSkills.map(skill => skill.id),
        active_during_business_hours: activeDuringBusinessHours,
        queue_id: queueId,
        status_id: statusId,
        issuetype: issueType,
        subissuetype: subIssueType,
        company: company,
        issuetype_id: issueTypeId,
        subissuetype_id: subIssueTypeId,
        company_id: companyId
      });

      // Reset form
      setQueue('');
      setQueueId(null);
      setStatus('');
      setStatusId(null);
      setMethod('round_robin');
      setSelectedSkills([]);
      setActiveDuringBusinessHours(true);
      setIssueType('');
      setIssueTypeId(null);
      setSubIssueType('');
      setSubIssueTypeId(null);
      setCompany('');
      setCompanyId(null);

      // Refresh rules
      fetchRules();
      setSuccess('Rule added successfully');
    } catch (err) {
      console.error('Error creating rule:', err);
      setError('Failed to add rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQueueChange = (event, newValue) => {
    if (newValue) {
      setQueue(newValue.name);
      setQueueId(newValue.id);
    } else {
      setQueue('');
      setQueueId(null);
    }
  };

  const handleStatusChange = (event, newValue) => {
    if (newValue) {
      setStatus(newValue.name);
      setStatusId(newValue.id);
    } else {
      setStatus('');
      setStatusId(null);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const handleIssueTypeChange = async (event, newValue) => {
    if (newValue) {
      setIssueType(newValue.name);
      setIssueTypeId(newValue.id);

      // Fetch sub-issue types for this issue type
      try {
        const subIssueTypesRes = await axios.get(`/api/auto-dispatch/autotask/sub-issue-types?issue_type_id=${newValue.id}`);
        setSubIssueTypes(subIssueTypesRes.data);

        // Reset sub-issue type selection
        setSubIssueType('');
        setSubIssueTypeId(null);
      } catch (err) {
        console.error('Error fetching sub-issue types:', err);
        setError('Failed to load sub-issue types. Please try again.');
      }
    } else {
      setIssueType('');
      setIssueTypeId(null);

      // Reset sub-issue types to all
      fetchAutotaskData();
    }
  };

  const handleSubIssueTypeChange = (event, newValue) => {
    if (newValue) {
      setSubIssueType(newValue.name);
      setSubIssueTypeId(newValue.id);
    } else {
      setSubIssueType('');
      setSubIssueTypeId(null);
    }
  };

  const handleCompanyChange = (event, newValue) => {
    if (newValue) {
      setCompany(newValue.CompanyName);
      setCompanyId(newValue.id);
    } else {
      setCompany('');
      setCompanyId(null);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchAutotaskData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Auto Dispatch Rules
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
                Create New Rule
              </Typography>

              {loadingAutotask ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={queues}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={handleQueueChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Queue" variant="outlined" />
                    )}
                  />

                  <Autocomplete
                    options={statuses}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={handleStatusChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Status" variant="outlined" />
                    )}
                  />

                  <Autocomplete
                    options={issueTypes}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={handleIssueTypeChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Issue Type" variant="outlined" />
                    )}
                  />

                  <Autocomplete
                    options={subIssueTypes}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={handleSubIssueTypeChange}
                    disabled={!issueTypeId}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Sub-Issue Type" 
                        variant="outlined"
                        helperText={!issueTypeId ? "Select an Issue Type first" : ""}
                      />
                    )}
                  />

                  <Autocomplete
                    options={companies}
                    getOptionLabel={(option) => option.CompanyName || ''}
                    onChange={handleCompanyChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Company" variant="outlined" />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="method-label">Assignment Method</InputLabel>
                    <Select
                      labelId="method-label"
                      value={method}
                      label="Assignment Method"
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <MenuItem value="round_robin">Round Robin</MenuItem>
                      <MenuItem value="best_fit">Best Fit</MenuItem>
                      <MenuItem value="lowest_load">Lowest Load</MenuItem>
                    </Select>
                  </FormControl>

                  <Autocomplete
                    multiple
                    options={skills}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedSkills}
                    onChange={(event, newValue) => {
                      setSelectedSkills(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Required Skills"
                        placeholder="Select skills"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={activeDuringBusinessHours}
                        onChange={(e) => setActiveDuringBusinessHours(e.target.checked)}
                      />
                    }
                    label="Active During Business Hours Only"
                  />

                  <Button 
                    variant="contained" 
                    onClick={createRule}
                    disabled={loading || !queue || !status}
                    startIcon={<AddIcon />}
                  >
                    Add Rule
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Existing Rules
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : rules.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No rules found. Create your first rule using the form.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {rules.map((rule) => (
                      <React.Fragment key={rule.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {rule.queue} / {rule.status}
                                </Typography>
                                {rule.active_during_business_hours && (
                                  <Chip 
                                    icon={<AccessTimeIcon />} 
                                    label="Business Hours Only" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  Method: {rule.method.replace('_', ' ')}
                                </Typography>

                                {/* Issue Type and Sub-Issue Type */}
                                {rule.issuetype && (
                                  <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                                    Issue Type: {rule.issuetype}
                                    {rule.subissuetype && ` / ${rule.subissuetype}`}
                                  </Typography>
                                )}

                                {/* Company */}
                                {rule.company && (
                                  <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                                    Company: {rule.company}
                                  </Typography>
                                )}

                                {/* Skills */}
                                <Box sx={{ mt: 1 }}>
                                  {rule.skills.length > 0 ? (
                                    rule.skills.map((skillId) => {
                                      const skill = skills.find(s => s.id === skillId);
                                      return (
                                        <Chip
                                          key={skillId}
                                          label={skill ? skill.name : `Skill ${skillId}`}
                                          size="small"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      );
                                    })
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">
                                      No skills required
                                    </Typography>
                                  )}
                                </Box>
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
