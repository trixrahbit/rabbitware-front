import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { useTenant } from '../contexts/TenantContext';

// Map API feature names to user-friendly labels
const FEATURE_LABELS = {
  next_ticket: 'Next Ticket',
  alerting: 'Alerting',
  monitoring: 'Monitoring',
  self_healing: 'Self Healing',
  orchestration: 'Orchestration',
  analytics: 'Analytics',
  calendar: 'Calendar',
  autodispatch: 'Auto Dispatch',
};

const FEATURES = Object.entries(FEATURE_LABELS).map(([value, label]) => ({
  value,
  label
}));

const getFeatureLabel = (feature) => FEATURE_LABELS[feature] || feature;

const normalizeFeature = (feature) => {
  if (FEATURE_LABELS[feature]) {
    return feature; // already API name
  }
  const entry = Object.entries(FEATURE_LABELS).find(([, label]) => label === feature);
  return entry ? entry[0] : feature;
};

export default function Subscriptions() {
  const { tenants, selectedTenantId } = useTenant();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const emptyForm = {
    tenant_id: selectedTenantId || '',
    name: '',
    features: [],
    price: '',
    start_date: '',
    end_date: ''
  };
  const [formData, setFormData] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const fetchSubscriptions = async () => {
    if (!selectedTenantId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/subscriptions?tenant_id=${selectedTenantId}`);
      const data = res.data.map((sub) => ({
        ...sub,
        features: Array.isArray(sub.features)
          ? sub.features.map(normalizeFeature)
          : []
      }));
      setSubscriptions(data);
    } catch (e) {
      console.error('Error fetching subscriptions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId]);

  useEffect(() => {
    if (openDialog) {
      setFormData({ ...emptyForm, tenant_id: selectedTenantId || '' });
    }
  }, [openDialog, selectedTenantId]);

  const handleCreate = async () => {
    try {
      await axios.post('/api/subscriptions', {
        tenant_id: formData.tenant_id,
        name: formData.name,
        features: formData.features,
        price: formData.price ? parseFloat(formData.price) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: true
      });
      setOpenDialog(false);
      setFormData({ ...emptyForm, tenant_id: selectedTenantId || '' });
      fetchSubscriptions();
    } catch (e) {
      console.error('Error creating subscription', e);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Subscriptions
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSubscriptions} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Create Subscription
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
      <TableHead>
        <TableRow>
          <TableCell>Tenant</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Features</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Start Date</TableCell>
          <TableCell>End Date</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {subscriptions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>{tenants.find((t) => t.id === sub.tenant_id)?.name || sub.tenant_id}</TableCell>
            <TableCell>{sub.name}</TableCell>
            <TableCell>{sub.features.map(getFeatureLabel).join(', ')}</TableCell>
            <TableCell>{sub.price ?? ''}</TableCell>
            <TableCell>{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>
              <Button size="small" onClick={() => {
                setEditingSub(sub);
                setFormData({
                  tenant_id: sub.tenant_id,
                  name: sub.name,
                  features: sub.features.map(normalizeFeature),
                  price: sub.price ?? '',
                  start_date: sub.start_date ? sub.start_date.substring(0,10) : '',
                  end_date: sub.end_date ? sub.end_date.substring(0,10) : ''
                });
                setEditOpen(true);
              }}>Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create Subscription</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mt: 1 }}
        />
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="tenant-label">Tenant</InputLabel>
          <Select
              labelId="tenant-label"
              value={formData.tenant_id}
              label="Tenant"
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            >
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="feature-label">Features</InputLabel>
            <Select
              labelId="feature-label"
              multiple
              value={formData.features}
              label="Features"
              onChange={(e) => {
                const { value } = e.target;
                setFormData({
                  ...formData,
                  features: typeof value === 'string' ? value.split(',') : value
                });
              }}
            >
              {FEATURES.map((f) => (
                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Subscription</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 1 }}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="edit-tenant-label">Tenant</InputLabel>
            <Select
              labelId="edit-tenant-label"
              value={formData.tenant_id}
              label="Tenant"
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            >
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="edit-feature-label">Features</InputLabel>
            <Select
              labelId="edit-feature-label"
              multiple
              value={formData.features}
              label="Features"
              onChange={(e) => {
                const { value } = e.target;
                setFormData({
                  ...formData,
                  features: typeof value === 'string' ? value.split(',') : value
                });
              }}
            >
              {FEATURES.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                await axios.put(`/api/subscriptions/${editingSub.id}`, {
                  name: formData.name,
                  features: formData.features,
                  price: formData.price ? parseFloat(formData.price) : null,
                  start_date: formData.start_date || null,
                  end_date: formData.end_date || null,
                  is_active: true
                });
                setEditOpen(false);
                setEditingSub(null);
                setFormData({ ...emptyForm, tenant_id: selectedTenantId || '' });
                fetchSubscriptions();
              } catch (e) {
                console.error('Error updating subscription', e);
              }
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

