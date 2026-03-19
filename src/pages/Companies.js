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
  Pagination,
  Divider,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentCompany, setCurrentCompany] = useState({
    id: null,
    CompanyName: '',
    isActive: true,
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    website: ''
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    // Show only active companies by default
    isActive: 'true',
    city: '',
    state: '',
    country: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Refetch companies when page or filters change
  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchCompanies(1);
  };

  // Clear filters
  const clearFilters = () => {
    // Reset to default filter of active companies
    setFilters({
      isActive: 'true',
      city: '',
      state: '',
      country: ''
    });
    setSearchTerm('');
    setPage(1);
    fetchCompanies(1);
  };

  const fetchCompanies = async (newPage = page) => {
    try {
      setLoading(true);

      // Build query parameters for pagination and filtering
      const params = {
        page: newPage,
        page_size: pageSize
      };

      // Add filters to query parameters if they have values
      if (filters.isActive !== '') params.is_active = filters.isActive;
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.country) params.country = filters.country;

      // Add search term if it exists
      if (searchTerm) params.search = searchTerm;

      // Fetch companies from the API with query parameters
      const response = await axios.get('/api/companies', { params });
      console.log('Companies response:', response.data);

      // Handle the paginated response structure
      setCompanies(response.data.companies || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.pages || 0);
      // Don't update page state here to avoid infinite loop

      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search when Enter key is pressed
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  };

  const getStatusChip = (isActive) => {
    return isActive ? 
      <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" /> : 
      <Chip icon={<InactiveIcon />} label="Inactive" color="error" size="small" />;
  };

  const handleOpenDialog = (company = null) => {
    if (company) {
      setCurrentCompany(company);
    } else {
      setCurrentCompany({
        id: null,
        CompanyName: '',
        isActive: true,
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        website: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCompany({
      ...currentCompany,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setCurrentCompany({
      ...currentCompany,
      [name]: checked
    });
  };

  const handleSaveCompany = async () => {
    try {
      // Validate required fields
      if (!currentCompany.CompanyName) {
        alert('Company name is required');
        return;
      }

      // Save the company to the API
      if (currentCompany.id) {
        // Update existing company
        await axios.put(`/api/companies/${currentCompany.id}`, currentCompany);
      } else {
        // Add new company
        await axios.post('/api/companies', currentCompany);
      }

      // Refresh the company list
      await fetchCompanies();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company. Please try again.');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        // Delete the company from the API
        await axios.delete(`/api/companies/${id}`);

        // Refresh the company list
        await fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company. Please try again.');
      }
    }
  };

  if (loading && companies.length === 0) {
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
          Companies
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New Company
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCompanies}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                {showFilters && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {showFilters && (
            <>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="City"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="State"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Country"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={applyFilters}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>City</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length > 0 ? (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.CompanyName}</TableCell>
                  <TableCell>{getStatusChip(company.isActive)}</TableCell>
                  <TableCell>{company.city || 'N/A'}</TableCell>
                  <TableCell>{company.state || 'N/A'}</TableCell>
                  <TableCell>{company.country || 'N/A'}</TableCell>
                  <TableCell>{company.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(company)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteCompany(company.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No companies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            showFirstButton 
            showLastButton
          />
          <Typography variant="body2" color="text.secondary" align="center">
            Showing {companies.length} of {totalItems} companies
          </Typography>
        </Stack>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentCompany.id ? 'Edit Company' : 'New Company'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              name="CompanyName"
              value={currentCompany.CompanyName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentCompany.isActive}
                  onChange={handleSwitchChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="Active"
              sx={{ mt: 2, mb: 1 }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={currentCompany.address}
              onChange={handleInputChange}
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={currentCompany.city}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={currentCompany.state}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postalCode"
                  value={currentCompany.postalCode}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={currentCompany.country}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={currentCompany.phone}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={currentCompany.website}
              onChange={handleInputChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCompany} 
            variant="contained" 
            color="primary"
            disabled={!currentCompany.CompanyName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}