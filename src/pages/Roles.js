import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  ListItemText,
  OutlinedInput,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    id: null,
    name: '',
    description: '',
    is_system_role: false,
    permissions: [],
    permission_ids: []
  });
  const [originalPermissionIds, setOriginalPermissionIds] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/roles');
      setRoles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching roles. Please try again.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/permissions');
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching permissions. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDialog = (role = null) => {
    if (role) {
      const permissionIds = role.permissions.map(p => p.id);
      setCurrentRole({
        ...role,
        permission_ids: permissionIds
      });
      setOriginalPermissionIds(permissionIds);
    } else {
      setCurrentRole({
        id: null,
        name: '',
        description: '',
        is_system_role: false,
        permissions: [],
        permission_ids: []
      });
      setOriginalPermissionIds([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole({
      ...currentRole,
      [name]: value
    });
  };

  const handlePermissionChange = (event) => {
    const {
      target: { value },
    } = event;

    setCurrentRole({
      ...currentRole,
      permission_ids: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const validateForm = () => {
    // For new roles, just check if name is provided
    if (!currentRole.id) {
      return currentRole.name.trim() !== '';
    }

    // For existing roles, check if anything has changed
    // For system roles, only permissions can be changed
    if (currentRole.is_system_role) {
      // Check if permissions have changed
      return havePermissionsChanged();
    }

    // For non-system roles, check if name, description, or permissions have changed
    return currentRole.name.trim() !== '' && 
           (currentRole.name !== roles.find(r => r.id === currentRole.id)?.name ||
            currentRole.description !== roles.find(r => r.id === currentRole.id)?.description ||
            havePermissionsChanged());
  };

  const havePermissionsChanged = () => {
    // Check if the permission arrays have different lengths
    if (currentRole.permission_ids.length !== originalPermissionIds.length) {
      return true;
    }

    // Convert to numbers and sort both arrays to ensure consistent comparison
    const sortedCurrent = [...currentRole.permission_ids].map(Number).sort((a, b) => a - b);
    const sortedOriginal = [...originalPermissionIds].map(Number).sort((a, b) => a - b);

    // Check if any permission has changed
    for (let i = 0; i < sortedCurrent.length; i++) {
      if (sortedCurrent[i] !== sortedOriginal[i]) {
        return true;
      }
    }

    return false;
  };

  const handleSaveRole = async () => {
    try {
      // Log the current role data for debugging
      console.log('Saving role with data:', {
        id: currentRole.id,
        name: currentRole.name,
        description: currentRole.description,
        is_system_role: currentRole.is_system_role,
        permission_ids: currentRole.permission_ids
      });

      if (currentRole.id) {
        // Update existing role
        let roleData;

        if (currentRole.is_system_role) {
          // For system roles, only update permissions
          roleData = {
            permission_ids: currentRole.permission_ids.map(id => Number(id)) // Ensure IDs are numbers
          };
        } else {
          // For non-system roles, update all fields
          roleData = {
            name: currentRole.name,
            description: currentRole.description,
            permission_ids: currentRole.permission_ids.map(id => Number(id)) // Ensure IDs are numbers
          };
        }

        console.log('Sending update data:', roleData);

        const response = await axios.put(`/api/roles/${currentRole.id}`, roleData);
        console.log('Update response:', response.data);

        setSnackbar({
          open: true,
          message: 'Role updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new role
        const roleData = {
          name: currentRole.name,
          description: currentRole.description,
          permission_ids: currentRole.permission_ids.map(id => Number(id)) // Ensure IDs are numbers
        };

        console.log('Sending create data:', roleData);

        const response = await axios.post('/api/roles', roleData);
        console.log('Create response:', response.data);

        setSnackbar({
          open: true,
          message: 'Role created successfully!',
          severity: 'success'
        });
      }

      // Refresh the roles list
      await fetchRoles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving role:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: `Error saving role: ${error.response?.data?.detail || 'Please try again.'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (role) => {
    setCurrentRole(role);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteRole = async () => {
    try {
      await axios.delete(`/api/roles/${currentRole.id}`);
      setSnackbar({
        open: true,
        message: 'Role deleted successfully!',
        severity: 'success'
      });

      // Refresh the roles list
      await fetchRoles();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting role:', error);
      setSnackbar({
        open: true,
        message: `Error deleting role: ${error.response?.data?.detail || 'Please try again.'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Group permissions by resource for better organization
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

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
          Roles
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New Role
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRoles}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search roles..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>System Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {role.name}
                    </Box>
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    {role.is_system_role ? (
                      <Chip label="System Role" color="secondary" size="small" />
                    ) : (
                      <Chip label="Custom Role" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.permissions.length > 0 ? (
                        role.permissions.slice(0, 3).map((permission) => (
                          <Chip 
                            key={permission.id} 
                            label={`${permission.resource}:${permission.action}`} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No permissions
                        </Typography>
                      )}
                      {role.permissions.length > 3 && (
                        <Chip 
                          label={`+${role.permissions.length - 3} more`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!role.is_system_role && (
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(role)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentRole.id ? 'Edit Role' : 'New Role'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="name"
                  value={currentRole.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  disabled={currentRole.is_system_role}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={currentRole.description || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Permissions
                  </Typography>
                  {currentRole.id && havePermissionsChanged() && (
                    <Chip 
                      label="Changes pending" 
                      color="warning" 
                      size="small" 
                      icon={<InfoIcon />} 
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>
                {Object.keys(groupedPermissions).length > 0 ? (
                  Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <Box key={resource} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {resource}
                      </Typography>
                      <Grid container spacing={1}>
                        {perms.map((permission) => (
                          <Grid item xs={12} sm={6} md={4} key={permission.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={currentRole.permission_ids.includes(permission.id)}
                                  onChange={(e) => {
                                    const newPermissionIds = e.target.checked
                                      ? [...currentRole.permission_ids, permission.id]
                                      : currentRole.permission_ids.filter(id => id !== permission.id);
                                    setCurrentRole({
                                      ...currentRole,
                                      permission_ids: newPermissionIds
                                    });
                                  }}
                                />
                              }
                              label={`${permission.action} (${permission.description || 'No description'})`}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions available
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveRole} 
            variant="contained" 
            color="primary"
            disabled={!validateForm()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role "{currentRole.name}"?
          </Typography>
          {currentRole.users && currentRole.users.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This role is assigned to {currentRole.users.length} user(s). Deleting it will remove the role from these users.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRole} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
