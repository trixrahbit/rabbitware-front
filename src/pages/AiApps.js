import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions,
  CircularProgress, Divider, IconButton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, FormControl, InputLabel, Chip, Tabs, Tab,
  Switch, FormControlLabel, Tooltip, Paper, Accordion,
  AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import {
  Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Delete as DeleteIcon, PlayArrow as PlayArrowIcon,
  SmartToy as AiIcon, Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon, History as HistoryIcon,
  ContentCopy as CopyIcon, Code as CodeIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function AiApps() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [providers, setProviders] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  const [form, setForm] = useState({
    name: '', description: '', ai_provider: 'claude', model: '',
    system_prompt: '', user_prompt_template: '{data}',
    data_sources: [], output_config: { format: 'text' },
    max_tokens: 4096, temperature: 0.7,
    schedule_type: '', schedule_value: '', is_active: true,
  });

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const [appsRes, provRes] = await Promise.all([
        axios.get('/api/ai-apps'),
        axios.get('/api/ai-apps/meta/providers'),
      ]);
      setApps(appsRes.data);
      setProviders(provRes.data.providers || []);
    } catch (err) {
      if (err.response?.status === 402) setAccessError('Subscription required.');
      else if (err.response?.status === 403) setAccessError('Access Denied');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const resetForm = () => setForm({
    name: '', description: '', ai_provider: 'claude', model: '',
    system_prompt: '', user_prompt_template: '{data}',
    data_sources: [], output_config: { format: 'text' },
    max_tokens: 4096, temperature: 0.7,
    schedule_type: '', schedule_value: '', is_active: true,
  });

  const handleCreate = () => { resetForm(); setEditingApp(null); setDialogOpen(true); };

  const handleEdit = (app) => {
    setForm({
      name: app.name, description: app.description || '',
      ai_provider: app.ai_provider, model: app.model || '',
      system_prompt: app.system_prompt || '',
      user_prompt_template: app.user_prompt_template || '{data}',
      data_sources: app.data_sources || [],
      output_config: app.output_config || { format: 'text' },
      max_tokens: app.max_tokens || 4096, temperature: app.temperature || 0.7,
      schedule_type: app.schedule_type || '', schedule_value: app.schedule_value || '',
      is_active: app.is_active,
    });
    setEditingApp(app);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (!payload.schedule_type) { payload.schedule_type = null; payload.schedule_value = null; }
      if (editingApp) {
        await axios.put(`/api/ai-apps/${editingApp.id}`, payload);
      } else {
        await axios.post('/api/ai-apps', payload);
      }
      fetchApps();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving AI app:', err);
      alert(err.response?.data?.detail || 'Error saving app');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this AI app and all its execution history?')) return;
    try {
      await axios.delete(`/api/ai-apps/${id}`);
      fetchApps();
    } catch (err) { console.error(err); }
    setAnchorEl(null);
  };

  const handleExecute = async (app) => {
    setExecuting(app.id);
    setExecutionResult(null);
    try {
      const res = await axios.post(`/api/ai-apps/${app.id}/execute`);
      setExecutionResult(res.data);
      fetchApps();
    } catch (err) {
      setExecutionResult({ success: false, error: err.response?.data?.detail || 'Execution failed' });
    } finally {
      setExecuting(null);
    }
    setAnchorEl(null);
  };

  const addDataSource = () => {
    setForm(f => ({
      ...f,
      data_sources: [...f.data_sources, { name: '', type: 'integration', integration_id: '', dataset_id: '' }]
    }));
  };

  const updateDataSource = (idx, field, value) => {
    setForm(f => {
      const ds = [...f.data_sources];
      ds[idx] = { ...ds[idx], [field]: value };
      return { ...f, data_sources: ds };
    });
  };

  const removeDataSource = (idx) => {
    setForm(f => ({ ...f, data_sources: f.data_sources.filter((_, i) => i !== idx) }));
  };

  const currentProvider = providers.find(p => p.id === form.ai_provider);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (accessError) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography variant="h6">{accessError}</Typography></Box>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>AI Apps</Typography>
          <Typography variant="body2" color="text.secondary">
            Build AI-powered applications that pull data from any source and use Claude or OpenAI.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>New AI App</Button>
      </Box>

      {/* Execution Result Banner */}
      {executionResult && (
        <Alert severity={executionResult.success ? 'success' : 'error'} sx={{ mb: 2 }}
               onClose={() => setExecutionResult(null)}>
          {executionResult.success
            ? `Completed in ${executionResult.execution_time_ms}ms | ${executionResult.tokens_used} tokens`
            : executionResult.error}
          {executionResult.response && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {executionResult.response.substring(0, 2000)}{executionResult.response.length > 2000 ? '...' : ''}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {apps.length === 0 ? (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <AiIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">No AI Apps Yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first AI app to automate tasks with Claude or OpenAI.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>Create AI App</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {apps.map(app => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AiIcon color={app.ai_provider === 'claude' ? 'secondary' : 'primary'} />
                      <Typography variant="h6" noWrap sx={{ maxWidth: 180 }}>{app.name}</Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedApp(app); }}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 40, overflow: 'hidden' }}>
                    {app.description || 'No description'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip size="small" label={app.ai_provider} color={app.ai_provider === 'claude' ? 'secondary' : 'primary'} />
                    <Chip size="small" label={app.is_active ? 'Active' : 'Inactive'} color={app.is_active ? 'success' : 'default'} />
                    {app.schedule_type && <Chip size="small" icon={<ScheduleIcon />} label={`${app.schedule_type}: ${app.schedule_value}`} />}
                    {app.data_sources?.length > 0 && <Chip size="small" label={`${app.data_sources.length} source(s)`} variant="outlined" />}
                  </Box>
                  {app.last_run_at && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Last run: {new Date(app.last_run_at).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Tooltip title="Run Now">
                    <IconButton size="small" onClick={() => handleExecute(app)} disabled={executing === app.id}>
                      {executing === app.id ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(app)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(app.id)}><DeleteIcon /></IconButton></Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { handleExecute(selectedApp); }}><PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />Run Now</MenuItem>
        <MenuItem onClick={() => { handleEdit(selectedApp); }}><EditIcon fontSize="small" sx={{ mr: 1 }} />Edit</MenuItem>
        <MenuItem onClick={() => { handleDelete(selectedApp?.id); }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />Delete</MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingApp ? 'Edit AI App' : 'Create AI App'}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="General" />
            <Tab label="Prompt & AI" />
            <Tab label="Data Sources" />
            <Tab label="Schedule" />
          </Tabs>

          {/* General Tab */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="App Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>AI Provider</InputLabel>
                  <Select value={form.ai_provider} label="AI Provider" onChange={e => setForm({...form, ai_provider: e.target.value, model: ''})}>
                    {providers.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select value={form.model} label="Model" onChange={e => setForm({...form, model: e.target.value})}>
                    <MenuItem value="">Default</MenuItem>
                    {currentProvider?.models?.map(m => <MenuItem key={m.id} value={m.id}>{m.name} ({(m.context/1000).toFixed(0)}K ctx)</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Output Format</InputLabel>
                  <Select value={form.output_config?.format || 'text'} label="Output Format"
                          onChange={e => setForm({...form, output_config: {...form.output_config, format: e.target.value}})}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />} label="Active" />
              </Grid>
            </Grid>
          )}

          {/* Prompt & AI Tab */}
          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="System Prompt" multiline rows={4} value={form.system_prompt}
                           onChange={e => setForm({...form, system_prompt: e.target.value})}
                           helperText="Instructions that define how the AI should behave." />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="User Prompt Template" multiline rows={6} value={form.user_prompt_template}
                           onChange={e => setForm({...form, user_prompt_template: e.target.value})}
                           helperText="Use {data} to inject all source data, or {source_name} for specific sources. Example: Analyze this ticket data: {tickets}" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Max Tokens" type="number" value={form.max_tokens}
                           onChange={e => setForm({...form, max_tokens: parseInt(e.target.value) || 4096})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Temperature" type="number" inputProps={{ step: 0.1, min: 0, max: 2 }}
                           value={form.temperature} onChange={e => setForm({...form, temperature: parseFloat(e.target.value) || 0.7})} />
              </Grid>
            </Grid>
          )}

          {/* Data Sources Tab */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Data Sources</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addDataSource}>Add Source</Button>
              </Box>
              {form.data_sources.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No data sources configured. The app will run with only the prompt. Add sources to feed data to the AI.
                </Typography>
              )}
              {form.data_sources.map((src, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={3}>
                      <TextField size="small" fullWidth label="Name" value={src.name}
                                 onChange={e => updateDataSource(idx, 'name', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select value={src.type} label="Type" onChange={e => updateDataSource(idx, 'type', e.target.value)}>
                          <MenuItem value="integration">Integration</MenuItem>
                          <MenuItem value="database">SQL Query</MenuItem>
                          <MenuItem value="static">Static Value</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {src.type === 'integration' && <>
                      <Grid item xs={2}><TextField size="small" fullWidth label="Integration ID" type="number" value={src.integration_id || ''} onChange={e => updateDataSource(idx, 'integration_id', parseInt(e.target.value) || '')} /></Grid>
                      <Grid item xs={2}><TextField size="small" fullWidth label="Dataset ID" value={src.dataset_id || ''} onChange={e => updateDataSource(idx, 'dataset_id', e.target.value)} /></Grid>
                    </>}
                    {src.type === 'database' && <Grid item xs={4}><TextField size="small" fullWidth label="SQL Query" value={src.query || ''} onChange={e => updateDataSource(idx, 'query', e.target.value)} /></Grid>}
                    {src.type === 'static' && <Grid item xs={4}><TextField size="small" fullWidth label="Value" value={src.value || ''} onChange={e => updateDataSource(idx, 'value', e.target.value)} /></Grid>}
                    <Grid item xs={1}><IconButton size="small" color="error" onClick={() => removeDataSource(idx)}><DeleteIcon /></IconButton></Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}

          {/* Schedule Tab */}
          {tabValue === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule</InputLabel>
                  <Select value={form.schedule_type} label="Schedule" onChange={e => setForm({...form, schedule_type: e.target.value})}>
                    <MenuItem value="">Manual Only</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                {form.schedule_type && (
                  <TextField fullWidth label="Schedule Value" value={form.schedule_value}
                             onChange={e => setForm({...form, schedule_value: e.target.value})}
                             helperText={
                               form.schedule_type === 'hourly' ? 'e.g. :00 (minute of hour)' :
                               form.schedule_type === 'daily' ? 'e.g. 09:00' :
                               form.schedule_type === 'weekly' ? 'e.g. monday 09:00' :
                               form.schedule_type === 'monthly' ? 'e.g. 1 09:00 (day of month)' : ''
                             } />
                )}
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Scheduled apps run automatically in the background. They use the configured data sources
                  and AI provider to generate results at each scheduled interval.
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.name || !form.ai_provider}>
            {editingApp ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
