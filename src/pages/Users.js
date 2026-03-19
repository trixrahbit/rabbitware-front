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
  Avatar,
  Switch,
  FormControlLabel,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: '',
    email: '',
    role: 'user', // Legacy field, kept for backward compatibility
    status: 'active',
    domain: '',
    lastLogin: null,
    roleIds: [] // New field for multiple role selection
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from the API
      const response = await axios.get('/api/users');
      const usersData = response.data;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            const userRoles = await fetchUserRoles(user.id);
            return {
              ...user,
              userRoles: userRoles
            };
          } catch (error) {
            console.error(`Error fetching roles for user ${user.id}:`, error);
            return {
              ...user,
              userRoles: []
            };
          }
        })
      );

      setUsers(usersWithRoles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUserRoles = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleChip = (role) => {
    switch (role) {
      case 'admin':
        return <Chip icon={<AdminIcon />} label="Admin" color="primary" size="small" />;
      case 'user':
        return <Chip icon={<UserIcon />} label="User" color="default" size="small" />;
      default:
        return <Chip label={role} size="small" />;
    }
  };

  const getUserRolesDisplay = (user) => {
    if (!user.userRoles || user.userRoles.length === 0) {
      // Fallback to legacy role if no roles are assigned
      return getRoleChip(user.role);
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {user.userRoles.slice(0, 2).map((role) => (
          <Chip key={role.id} label={role.name} size="small" />
        ))}
        {user.userRoles.length > 2 && (
          <Chip label={`+${user.userRoles.length - 2}`} size="small" variant="outlined" />
        )}
      </Box>
    );
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />;
      case 'inactive':
        return <Chip icon={<InactiveIcon />} label="Inactive" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleOpenDialog = async (user = null) => {
    if (user) {
      // When editing an existing user, initialize with empty password fields
      // and fetch their roles
      const userRoles = await fetchUserRoles(user.id);
      setCurrentUser({
        ...user,
        password: '',
        confirmPassword: '',
        roleIds: userRoles.map(role => role.id)
      });
    } else {
      // When creating a new user
      setCurrentUser({
        id: null,
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        domain: '',
        lastLogin: null,
        password: '',
        confirmPassword: '',
        roleIds: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: checked ? 'active' : 'inactive'
    });
  };

  const extractDomainFromEmail = (email) => {
    if (!email || !email.includes('@')) return '';
    return email.split('@')[1];
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCurrentUser({
      ...currentUser,
      email,
      domain: extractDomainFromEmail(email)
    });
  };

  const validateForm = () => {
    if (!currentUser.name) return false;
    if (!currentUser.email || !currentUser.email.includes('@')) return false;

    // For new users, password is required and must be at least 8 characters
    if (currentUser.id === null && (!currentUser.password || currentUser.password.length < 8)) return false;

    // For existing users, if password is provided, it must be at least 8 characters
    if (currentUser.id !== null && currentUser.password && currentUser.password.length < 8) return false;

    // Password and confirm password must match if password is provided
    if (currentUser.password && currentUser.password !== currentUser.confirmPassword) return false;

    return true;
  };

  const handleSaveUser = async () => {
    try {
      // Save the user to the API
      if (currentUser.id) {
        // Update existing user
        await axios.put(`/api/users/${currentUser.id}`, currentUser);

        // Update user roles
        await axios.put(`/api/users/${currentUser.id}/roles`, { role_ids: currentUser.roleIds });
      } else {
        // Add new user
        const response = await axios.post('/api/users', currentUser);

        // Update roles for the newly created user
        if (response.data && response.data.id && currentUser.roleIds.length > 0) {
          await axios.put(`/api/users/${response.data.id}/roles`, { role_ids: currentUser.roleIds });
        }
      }

      // Refresh the user list
      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.detail || 'Unknown error occurred';
      alert(`Error saving user: ${errorMessage}. Please try again.`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete the user from the API
        await axios.delete(`/api/users/${id}`);

        // Refresh the user list
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
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
          Users
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New User
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users..."
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
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }} src={user.avatar}>
                        {user.name.charAt(0)}
                      </Avatar>
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.domain}</TableCell>
                  <TableCell>{getUserRolesDisplay(user)}</TableCell>
                  <TableCell>{getStatusChip(user.status)}</TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentUser.id ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={currentUser.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={currentUser.email}
                  onChange={handleEmailChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={currentUser.password || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required={currentUser.id === null}
                  helperText={currentUser.id === null ? "Password must be at least 8 characters" : "Leave blank to keep current password"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={currentUser.confirmPassword || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required={currentUser.id === null}
                  error={currentUser.password && currentUser.password !== currentUser.confirmPassword}
                  helperText={
                    currentUser.password && currentUser.password !== currentUser.confirmPassword
                      ? "Passwords don't match"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    name="roleIds"
                    value={currentUser.roleIds}
                    onChange={(e) => {
                      setCurrentUser({
                        ...currentUser,
                        roleIds: e.target.value,
                        // Set the legacy role field based on the selected roles
                        // Check role name case-insensitively since roles from the
                        // backend may be capitalized (e.g. "Admin")
                        role: e.target.value.includes(
                          roles.find(r => r.name.toLowerCase() === 'admin')?.id
                        ) ? 'admin' : 'user'
                      });
                    }}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((roleId) => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Chip key={roleId} label={role.name} size="small" />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Checkbox checked={currentUser.roleIds.indexOf(role.id) > -1} />
                        <ListItemText primary={role.name} secondary={role.description} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Select one or more roles for this user
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentUser.status === 'active'}
                        onChange={(e) => handleSwitchChange({ target: { name: 'status', checked: e.target.checked } })}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                  <FormHelperText>
                    Inactive users cannot log in
                  </FormHelperText>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Domain"
                  value={currentUser.domain}
                  margin="normal"
                  disabled
                  helperText="Domain is automatically extracted from email"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
            disabled={!validateForm()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
