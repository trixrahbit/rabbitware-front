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
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Warning as ExpiringIcon,
  Error as ExpiredIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentContract, setCurrentContract] = useState({
    id: null,
    contractNumber: '',
    name: '',
    clientName: '',
    startDate: null,
    endDate: null,
    value: 0,
    status: 'active',
    type: 'monthly'
  });
  const [clients, setClients] = useState([
    { id: 1, name: 'Acme Corporation' },
    { id: 2, name: 'Wayne Enterprises' },
    { id: 3, name: 'Stark Industries' },
    { id: 4, name: 'Umbrella Corporation' },
    { id: 5, name: 'Cyberdyne Systems' }
  ]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // In a real application, you would fetch contracts from your API
      // const response = await axios.get('/api/contracts');
      // setContracts(response.data);

      // For now, we'll simulate a delay and use mock data
      setTimeout(() => {
        setContracts([
          {
            id: 1,
            contractNumber: 'C1001',
            name: 'Managed IT Services',
            clientName: 'Acme Corporation',
            clientId: 1,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            value: 24000,
            status: 'active',
            type: 'monthly'
          },
          {
            id: 2,
            contractNumber: 'C1002',
            name: 'Cloud Migration',
            clientName: 'Wayne Enterprises',
            clientId: 2,
            startDate: '2023-03-15',
            endDate: '2023-09-15',
            value: 15000,
            status: 'active',
            type: 'fixed'
          },
          {
            id: 3,
            contractNumber: 'C1003',
            name: 'Security Audit',
            clientName: 'Stark Industries',
            clientId: 3,
            startDate: '2023-02-01',
            endDate: '2023-03-01',
            value: 5000,
            status: 'expired',
            type: 'fixed'
          },
          {
            id: 4,
            contractNumber: 'C1004',
            name: 'Hardware Support',
            clientName: 'Umbrella Corporation',
            clientId: 4,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            value: 18000,
            status: 'active',
            type: 'monthly'
          },
          {
            id: 5,
            contractNumber: 'C1005',
            name: 'Software Development',
            clientName: 'Cyberdyne Systems',
            clientId: 5,
            startDate: '2023-05-01',
            endDate: '2023-08-01',
            value: 30000,
            status: 'expiring',
            type: 'fixed'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContracts = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />;
      case 'expiring':
        return <Chip icon={<ExpiringIcon />} label="Expiring Soon" color="warning" size="small" />;
      case 'expired':
        return <Chip icon={<ExpiredIcon />} label="Expired" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const handleOpenDialog = (contract = null) => {
    if (contract) {
      setCurrentContract({
        ...contract,
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate)
      });
    } else {
      setCurrentContract({
        id: null,
        contractNumber: `C${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        clientId: '',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        value: 0,
        status: 'active',
        type: 'monthly'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentContract({
      ...currentContract,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setCurrentContract({
      ...currentContract,
      [name]: date
    });
  };

  const handleSaveContract = async () => {
    try {
      // In a real application, you would save the contract to your API
      // if (currentContract.id) {
      //   await axios.put(`/api/contracts/${currentContract.id}`, currentContract);
      // } else {
      //   await axios.post('/api/contracts', currentContract);
      // }

      // For now, we'll simulate saving and update the local state
      const selectedClient = clients.find(c => c.id === parseInt(currentContract.clientId));

      if (currentContract.id) {
        // Update existing contract
        setContracts(contracts.map(contract => 
          contract.id === currentContract.id ? {
            ...currentContract,
            clientName: selectedClient?.name,
            startDate: currentContract.startDate.toISOString().split('T')[0],
            endDate: currentContract.endDate.toISOString().split('T')[0]
          } : contract
        ));
      } else {
        // Add new contract
        const newContract = {
          ...currentContract,
          id: Math.max(...contracts.map(c => c.id)) + 1,
          clientName: selectedClient?.name,
          startDate: currentContract.startDate.toISOString().split('T')[0],
          endDate: currentContract.endDate.toISOString().split('T')[0]
        };
        setContracts([...contracts, newContract]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleDeleteContract = async (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        // In a real application, you would delete the contract from your API
        // await axios.delete(`/api/contracts/${id}`);

        // For now, we'll just update the local state
        setContracts(contracts.filter(contract => contract.id !== id));
      } catch (error) {
        console.error('Error deleting contract:', error);
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
          Contracts
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New Contract
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchContracts}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search contracts..."
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
              <TableCell>Contract #</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>{contract.clientName}</TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(contract.value)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={contract.type === 'monthly' ? 'Monthly' : 'Fixed'} 
                      color={contract.type === 'monthly' ? 'primary' : 'secondary'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(contract.status)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(contract)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteContract(contract.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No contracts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{currentContract.id ? 'Edit Contract' : 'New Contract'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contract Number"
                    name="contractNumber"
                    value={currentContract.contractNumber}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!!currentContract.id}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Client</InputLabel>
                    <Select
                      name="clientId"
                      value={currentContract.clientId}
                      onChange={handleInputChange}
                      label="Client"
                    >
                      {clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contract Name"
                    name="name"
                    value={currentContract.name}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={currentContract.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={currentContract.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contract Value"
                    name="value"
                    type="number"
                    value={currentContract.value}
                    onChange={handleInputChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Contract Type</InputLabel>
                    <Select
                      name="type"
                      value={currentContract.type}
                      onChange={handleInputChange}
                      label="Contract Type"
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="fixed">Fixed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={currentContract.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expiring">Expiring Soon</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveContract} 
              variant="contained" 
              color="primary"
              disabled={!currentContract.name || !currentContract.clientId}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
}
