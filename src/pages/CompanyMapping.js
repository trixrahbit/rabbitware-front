// Cleaned and fixed version of your component
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const COMPANY_TYPES = [
  '',
  'customer',
  'lead',
  'prospect',
  'dead',
  'cancelation',
  'vendor',
  'partner'
];

export default function CompanyMapping() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [localCompanies, setLocalCompanies] = useState([]);
  const [externalCompanies, setExternalCompanies] = useState([]);
  const [mapping, setMapping] = useState({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newIntegrationCompany, setNewIntegrationCompany] = useState(null);
  const [autoStatus, setAutoStatus] = useState('active');
  const [autoType, setAutoType] = useState('');

  // Enhanced company ID extraction to handle different formats
  const getCompanyId = (c) => {
    if (!c) return null;

    // Try to extract ID from various possible properties
    // Check for common ID field names in different case formats
    const possibleIdFields = [
      'id', 'ID', 'Id', 
      'siteId', 'SiteId', 'siteID', 'SiteID',
      'companyId', 'CompanyId', 'companyID', 'CompanyID',
      'company_id', 'Company_Id', 'company_ID', 'Company_ID',
      'external_id', 'External_Id', 'externalId', 'ExternalId'
    ];

    for (const field of possibleIdFields) {
      if (c[field] !== undefined && c[field] !== null) {
        return c[field];
      }
    }

    // If we have an object with a single numeric property, use that
    if (typeof c === 'object' && Object.keys(c).length === 1) {
      const value = Object.values(c)[0];
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
        return value;
      }
    }

    // Last resort: if the object itself is a number or numeric string, use that
    if (typeof c === 'number' || (typeof c === 'string' && !isNaN(c))) {
      return c;
    }

    return null;
  };

  // Enhanced company name extraction to handle different formats
  const getCompanyName = (c) => {
    if (!c) return '';

    // Try to extract name from various possible properties
    // Check for common name field names in different case formats
    const possibleNameFields = [
      'companyName', 'CompanyName', 'company_name', 'Company_Name',
      'name', 'Name', 'NAME',
      'siteName', 'SiteName', 'site_name', 'Site_Name',
      'title', 'Title', 'TITLE',
      'label', 'Label', 'LABEL',
      'displayName', 'DisplayName', 'display_name', 'Display_Name'
    ];

    for (const field of possibleNameFields) {
      if (c[field] !== undefined && c[field] !== null && c[field] !== '') {
        return c[field];
      }
    }

    // If we have an object with a single string property, use that
    if (typeof c === 'object' && Object.keys(c).length === 1) {
      const value = Object.values(c)[0];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    // Last resort: if the object itself is a string, use that
    if (typeof c === 'string' && c.length > 0) {
      return c;
    }

    // If we have an ID, use that as a fallback
    const id = getCompanyId(c);
    if (id !== null) {
      return `Company ${id}`;
    }

    return '';
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [intRes, compRes] = await Promise.all([
          axios.get('/api/integrations'),
          axios.get('/api/companies/all')
        ]);
        const filtered = intRes.data.filter(
          (i) => !['ms365', 'teams', 'teamscommand', 'openai'].includes(i.integration_type)
        );

        // Remove duplicates or broken company entries
        const validCompanies = compRes.data
          .filter(c => c.CompanyName && c.CompanyName.length > 2)
          .reduce((acc, curr) => {
            if (!acc.find(c => c.CompanyName === curr.CompanyName)) acc.push(curr);
            return acc;
          }, []);

        // Process local companies data

        setIntegrations(filtered);
        setLocalCompanies(validCompanies);
      } catch (err) {
        console.error('Error loading data', err);
        enqueueSnackbar('Failed to load integrations or companies.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const fetchExternal = async () => {
    if (!selectedIntegration) return;
    const integ = integrations.find((i) => i.id === selectedIntegration);
    if (!integ) return;

    try {
      setLoadingExternal(true);
      let url = '';
      if (integ.integration_type === 'autotask_psa') {
        const params = new URLSearchParams();
        if (autoStatus) params.append('status', autoStatus);
        if (autoType) params.append('company_type', autoType);
        url = `/api/integrations/autotask/companies?${params.toString()}`;
      } else if (integ.integration_type === 'datto_rmm') {
        url = '/api/integrations/datto/sites';
      } else {
        setExternalCompanies([]);
      }

      if (url) {
        const res = await axios.get(url);
        setExternalCompanies(res.data);
      }

      const mapRes = await axios.get(`/api/company-mappings/${selectedIntegration}`);
      const mapObj = {};

      // Process mapping data more robustly
      mapRes.data.forEach((c) => {
        // Make sure we have both a company ID and an external ID
        const companyId = c.id || c.company_id;
        const externalId = c.external_id;

        if (companyId && externalId) {
          // Ensure both IDs are strings to avoid type issues
          mapObj[String(companyId)] = String(externalId);
        }
      });

      setMapping(mapObj);
    } catch (err) {
      console.error('Error fetching integration companies', err);
      enqueueSnackbar('Failed to fetch external companies.', { variant: 'error' });
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => {
    fetchExternal();
  }, [selectedIntegration, integrations]);

  const handleMappingChange = (companyId, extId) => {
    // Ensure extId is a string to avoid type issues
    const extIdStr = String(extId || '');
    setMapping(prev => ({ ...prev, [companyId]: extIdStr }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Create a clean copy of the mapping object to ensure consistent data types
      const cleanMappings = {};
      Object.entries(mapping).forEach(([companyId, externalId]) => {
        if (externalId) {
          cleanMappings[companyId] = String(externalId);
        }
      });

      await axios.post(`/api/company-mappings/${selectedIntegration}`, { mappings: cleanMappings });

      enqueueSnackbar('Mappings saved successfully', { variant: 'success' });

      // Refresh the data to ensure we have the latest mappings
      fetchExternal();
    } catch (err) {
      console.error('Error saving mappings', err);
      enqueueSnackbar('Error saving mappings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (company) => {
    try {
      await axios.post('/api/companies', {
        CompanyName: getCompanyName(company)
      });
      enqueueSnackbar('Company created successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error creating company', err);
      enqueueSnackbar('Error creating company', { variant: 'error' });
    }
  };

  const unmappedExternalCompanies = externalCompanies.filter(
    (c) => {
      // Convert company ID to string for consistent comparison
      const companyIdStr = String(getCompanyId(c) || '');
      // Check if this ID exists in any of the mapping values (also as strings)
      return !Object.values(mapping).some(mappedId => String(mappedId) === companyIdStr);
    }
  );

  const openAddDialog = () => {
    setAddDialogOpen(true);
    setNewCompanyName('');
    setNewIntegrationCompany(null);
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setNewCompanyName('');
    setNewIntegrationCompany(null);
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName || !newIntegrationCompany) return;
    try {
      const res = await axios.post('/api/companies', { CompanyName: newCompanyName });
      const created = res.data;
      setLocalCompanies(prev => [...prev, created]);
      const extId = getCompanyId(newIntegrationCompany);
      await axios.post(`/api/company-mappings/${selectedIntegration}`, {
        mappings: { [created.id]: extId }
      });
      setMapping(prev => ({ ...prev, [created.id]: extId }));
      closeAddDialog();
      enqueueSnackbar('Company and mapping created successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error creating company', err);
      enqueueSnackbar('Error creating company', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Company Mapping</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="integration-label">Integration</InputLabel>
        <Select
          labelId="integration-label"
          value={selectedIntegration}
          label="Integration"
          onChange={e => setSelectedIntegration(e.target.value)}
        >
          {integrations.map(intg => (
            <MenuItem key={intg.id} value={intg.id}>{intg.integration_type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedIntegration && integrations.find(i => i.id === selectedIntegration)?.integration_type === 'autotask_psa' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Status"
            value={autoStatus}
            onChange={e => setAutoStatus(e.target.value)}
            size="small"
          />
          <FormControl size="small">
            <InputLabel id="company-type-label">Company Type</InputLabel>
            <Select
              labelId="company-type-label"
              label="Company Type"
              value={autoType}
              onChange={(e) => setAutoType(e.target.value)}
            >
              {COMPANY_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t || 'Any'}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchExternal} disabled={loadingExternal}>Apply Filters</Button>
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Integration Company</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localCompanies.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.CompanyName}</TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      options={externalCompanies}
                      loading={loadingExternal}
                      getOptionLabel={getCompanyName}
                      value={(() => {
                        // Get the external ID from the mapping
                        const externalId = mapping[c.id];

                        if (!externalId) {
                          return null;
                        }

                        // Try to find the external company by ID
                        // Convert both IDs to strings for comparison to avoid type mismatches
                        const matchedCompany = externalCompanies.find(ec => {
                          const ecId = getCompanyId(ec);
                          return String(ecId) === String(externalId);
                        });

                        return matchedCompany || null;
                      })()}
                      onChange={(e, val) => {
                        const extId = val ? getCompanyId(val) : '';
                        handleMappingChange(c.id, extId);
                      }}
                      isOptionEqualToValue={(opt, val) => {
                        // Convert both IDs to strings for comparison to avoid type mismatches
                        return String(getCompanyId(opt)) === String(getCompanyId(val));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          placeholder="None"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingExternal ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      clearOnEscape
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={openAddDialog}>Add Company</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>Save Mappings</Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Unmapped External Companies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>External Company</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unmappedExternalCompanies.map((c) => (
                <TableRow key={getCompanyId(c)}>
                  <TableCell>{getCompanyName(c)}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCreate(c)}
                    >
                      Create Company
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onClose={closeAddDialog}>
        <DialogTitle>Create Company</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            fullWidth
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
          />
          <Autocomplete
            sx={{ mt: 2 }}
            options={externalCompanies}
            loading={loadingExternal}
            getOptionLabel={getCompanyName}
            value={newIntegrationCompany}
            onChange={(e, val) => setNewIntegrationCompany(val)}
            isOptionEqualToValue={(opt, val) => {
              // Convert both IDs to strings for comparison to avoid type mismatches
              return String(getCompanyId(opt)) === String(getCompanyId(val));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Integration Company"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingExternal ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button onClick={handleCreateCompany} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
