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
  FormControlLabel,
  Tabs,
  Tab,
  Autocomplete,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
// Import Recharts components for performance metrics charts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Help as UnknownIcon,
  Download as DownloadIcon,
  Label as LabelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// Component to display tally marks for job executions
const JobTallyMarks = ({ executions }) => {
  // Ensure we have an array of executions, or use an empty array
  const jobExecutions = executions || [];

  // Take the last 10 executions (or fewer if there aren't 10)
  const lastTenExecutions = jobExecutions.slice(0, 10);

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {lastTenExecutions.map((execution, index) => {
        const isSuccess = execution.status === 'completed';
        return (
          <Box
            key={index}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: isSuccess ? 'success.main' : 'error.main',
              display: 'inline-block'
            }}
            title={`${isSuccess ? 'Success' : 'Failed'}: ${new Date(execution.started_at).toLocaleString()}`}
          />
        );
      })}
      {/* If we have fewer than 10 executions, add empty placeholders */}
      {Array.from({ length: Math.max(0, 10 - lastTenExecutions.length) }).map((_, index) => (
        <Box
          key={`empty-${index}`}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'grey.300',
            display: 'inline-block'
          }}
          title="No execution data"
        />
      ))}
    </Box>
  );
};

export default function Devices() {
  const navigate = useNavigate();
  const { companyId } = useParams();

  const [devices, setDevices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selfHealingJobs, setSelfHealingJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [jobExecutions, setJobExecutions] = useState({});
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [executionsError, setExecutionsError] = useState(null);
  const [monitoringPolicies, setMonitoringPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policiesError, setPoliciesError] = useState(null);
  const [policyExecutions, setPolicyExecutions] = useState({});
  const [policyExecutionsLoading, setPolicyExecutionsLoading] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [deviceDetailsLoading, setDeviceDetailsLoading] = useState(false);
  const [deviceTags, setDeviceTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentDevice, setCurrentDevice] = useState({
    id: null,
    name: '',
    device_name: '',
    company_id: companyId ? parseInt(companyId) : null,
    profile_id: null,
    description: '',
    operating_system: '',
    ipv4_address: '',
    last_logged_on_user: '',
    health_status: 'Unknown',
    is_active: true
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    company_id: companyId ? parseInt(companyId) : '',
    profile_id: '',
    is_active: '',
    health_status: ''
  });

  // Download agent dialog
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [downloadCompanyId, setDownloadCompanyId] = useState('');
  const [downloadToken, setDownloadToken] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadExpiry, setDownloadExpiry] = useState(7);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [tokenGenerating, setTokenGenerating] = useState(false);

  // Agent downloads list state
  const [activeTab, setActiveTab] = useState('create');
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);
  const [downloadsPage, setDownloadsPage] = useState(1);
  const [downloadsPageSize, setDownloadsPageSize] = useState(10);
  const [downloadsTotalPages, setDownloadsTotalPages] = useState(0);
  const [downloadsTotalItems, setDownloadsTotalItems] = useState(0);
  const [downloadsSearchTerm, setDownloadsSearchTerm] = useState('');
  const [downloadsCompanyFilter, setDownloadsCompanyFilter] = useState('');

  // Performance metrics state
  const [cpuMetrics, setCpuMetrics] = useState([]);
  const [memoryMetrics, setMemoryMetrics] = useState([]);
  const [diskMetrics, setDiskMetrics] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    fetchDevices();
    fetchCompanies();
    fetchProfiles();
  }, []);

  // Refetch devices when page or filters change
  useEffect(() => {
    fetchDevices(Number(page));
  }, [page, pageSize]);

  // Update filters when companyId changes
  useEffect(() => {
    if (companyId) {
      setFilters(prev => ({
        ...prev,
        company_id: parseInt(companyId)
      }));
    }
  }, [companyId]);

  // Fetch agent downloads when dialog is opened or when pagination/search changes
  useEffect(() => {
    if (openDownloadDialog && activeTab === 'list') {
      fetchAgentDownloads();
    }
  }, [openDownloadDialog, activeTab, downloadsPage, downloadsPageSize, downloadsSearchTerm, downloadsCompanyFilter]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(Number(newPage));
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
    fetchDevices(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      company_id: companyId ? parseInt(companyId) : '',
      profile_id: '',
      is_active: '',
      health_status: ''
    });
    setSearchTerm('');
    setPage(1);
    fetchDevices(1);
  };

  const fetchDevices = async (newPage = page) => {
    try {
      setLoading(true);

      // Build query parameters for pagination and filtering
      const params = {
        page: Number(newPage), // Ensure page is a number
        page_size: pageSize
      };

      // Add filters to query parameters if they have values
      if (filters.company_id !== '') params.company_id = filters.company_id;
      if (filters.profile_id !== '') params.profile_id = filters.profile_id;
      if (filters.is_active !== '') params.is_active = filters.is_active;
      if (filters.health_status !== '') params.health_status = filters.health_status;

      // Add search term if it exists
      if (searchTerm) params.search = searchTerm;

      // Fetch devices from the API with query parameters
      const response = await axios.get('/api/devices', { params });
      console.log('Devices response:', response.data);

      // Handle the paginated response structure
      setDevices(response.data.devices || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.pages || 0);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      // Use the dedicated endpoint that already filters to active companies
      const response = await axios.get('/api/companies/all');
      const companiesData = Array.isArray(response.data)
        ? response.data
        : response.data.companies || [];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/profiles');
      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchAgentDownloads = async (page = downloadsPage, searchTerm = downloadsSearchTerm, companyId = downloadsCompanyFilter) => {
    try {
      setDownloadsLoading(true);

      // Build query parameters
      const params = {
        page,
        page_size: downloadsPageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (companyId) {
        params.company_id = companyId;
      }

      // Fetch agent downloads
      const response = await axios.get('/api/agent-downloads', { params });
      console.log('Agent downloads response:', response.data);

      setDownloads(response.data.downloads || []);
      setDownloadsTotalItems(response.data.total || 0);
      setDownloadsTotalPages(response.data.pages || 0);
      setDownloadsLoading(false);
    } catch (error) {
      console.error('Error fetching agent downloads:', error);
      setDownloadsLoading(false);
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

  const getHealthStatusChip = (status) => {
    switch (status) {
      case 'Healthy':
        return <Chip icon={<HealthyIcon />} label="Healthy" color="success" size="small" />;
      case 'Warning':
        return <Chip icon={<WarningIcon />} label="Warning" color="warning" size="small" />;
      case 'Error':
        return <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />;
      default:
        return <Chip icon={<UnknownIcon />} label="Unknown" color="default" size="small" />;
    }
  };

  const getStatusChip = (isActive) => {
    return isActive ? 
      <Chip label="Active" color="success" size="small" /> : 
      <Chip label="Inactive" color="error" size="small" />;
  };

  const handleOpenDialog = (device = null) => {
    if (device) {
      setCurrentDevice(device);
    } else {
      setCurrentDevice({
        id: null,
        name: '',
        device_name: '',
        company_id: companyId ? parseInt(companyId) : null,
        profile_id: null,
        operating_system: '',
        ipv4_address: '',
        last_logged_on_user: '',
        health_status: 'Unknown',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const fetchDeviceMetrics = async (deviceId, metricType) => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);

      // Get metrics for the last 24 hours
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const response = await axios.get(`/api/devices/${deviceId}/metrics/${metricType}`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: 100
        }
      });

      // Process the data for the charts
      if (metricType === 'cpu') {
        setCpuMetrics(response.data.data || []);
      } else if (metricType === 'memory') {
        setMemoryMetrics(response.data.data || []);
      } else if (metricType === 'disk') {
        setDiskMetrics(response.data.data || []);
      }

      setMetricsLoading(false);
    } catch (error) {
      console.error(`Error fetching ${metricType} metrics:`, error);
      setMetricsError(`Failed to load ${metricType} metrics. ${error.response?.data?.detail || error.message}`);
      setMetricsLoading(false);
    }
  };

  const fetchSelfHealingJobs = async (deviceId) => {
    try {
      setJobsLoading(true);
      setJobsError(null);

      const response = await axios.get(`/api/self-healing/jobs`, {
        params: {
          device_id: deviceId
        }
      });

      const jobs = response.data || [];
      setSelfHealingJobs(jobs);
      setJobsLoading(false);

      // Fetch executions for each job
      if (jobs.length > 0) {
        fetchJobExecutions(deviceId);
      }
    } catch (error) {
      console.error('Error fetching self-healing jobs:', error);
      setJobsError(`Failed to load monitoring scripts. ${error.response?.data?.detail || error.message}`);
      setJobsLoading(false);
    }
  };

  const fetchJobExecutions = async (deviceId) => {
    try {
      setExecutionsLoading(true);
      setExecutionsError(null);

      const response = await axios.get(`/api/self-healing/executions`, {
        params: {
          device_id: deviceId,
          page: 1,
          page_size: 10
        }
      });

      // Group executions by job_id
      const executionsByJob = {};
      if (response.data && response.data.executions) {
        response.data.executions.forEach(execution => {
          if (!executionsByJob[execution.job_id]) {
            executionsByJob[execution.job_id] = [];
          }
          executionsByJob[execution.job_id].push(execution);
        });
      }

      setJobExecutions(executionsByJob);
      setExecutionsLoading(false);
    } catch (error) {
      console.error('Error fetching job executions:', error);
      setExecutionsError(`Failed to load execution history. ${error.response?.data?.detail || error.message}`);
      setExecutionsLoading(false);
    }
  };

  const fetchMonitoringPolicies = async (deviceId) => {
    try {
      setPoliciesLoading(true);
      setPoliciesError(null);

      const response = await axios.get(`/api/monitoring/policies`, {
        params: {
          device_id: deviceId
        }
      });

      const policies = response.data || [];
      setMonitoringPolicies(policies);
      setPoliciesLoading(false);

      // Fetch executions for each policy
      if (policies.length > 0) {
        fetchPolicyExecutions(policies, deviceId);
      }
    } catch (error) {
      console.error('Error fetching monitoring policies:', error);
      setPoliciesError(`Failed to load monitoring policies. ${error.response?.data?.detail || error.message}`);
      setPoliciesLoading(false);
    }
  };

  const fetchPolicyExecutions = async (policies, deviceId) => {
    setPolicyExecutionsLoading(true);
    const executionsByPolicy = {};

    try {
      // Fetch last 10 executions for each policy
      const promises = policies.map(async (policy) => {
        try {
          const response = await axios.get(`/api/monitoring/executions`, {
            params: {
              policy_id: policy.id,
              device_id: deviceId,
              limit: 10,
              sort: 'desc'
            }
          });

          executionsByPolicy[policy.id] = response.data.executions || [];
        } catch (error) {
          console.error(`Error fetching executions for policy ${policy.id}:`, error);
          executionsByPolicy[policy.id] = [];
        }
      });

      await Promise.all(promises);
      setPolicyExecutions(executionsByPolicy);
    } catch (error) {
      console.error('Error fetching policy executions:', error);
    } finally {
      setPolicyExecutionsLoading(false);
    }
  };

  const fetchDeviceDetail = async (deviceId) => {
    try {
      setDeviceDetailsLoading(true);
      const response = await axios.get(`/api/devices/${deviceId}`);
      setSelectedDevice(response.data);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setDeviceDetailsLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, isActive) => {
    try {
      await axios.put(`/api/self-healing/jobs/${jobId}`, {
        is_active: !isActive
      });

      // Refresh the jobs list
      if (selectedDevice && selectedDevice.id) {
        fetchSelfHealingJobs(selectedDevice.id);
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
      alert('Error toggling monitoring script status. Please try again.');
    }
  };

  const fetchAllTags = async () => {
    try {
      setTagsLoading(true);
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'general' }
      });
      setAllTags(response.data);
      setTagsLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTagsLoading(false);
    }
  };

  const fetchDeviceTags = async (deviceId) => {
    try {
      setTagsLoading(true);
      const response = await axios.get(`/api/devices/${deviceId}/tags`);
      setDeviceTags(response.data);
      setTagsLoading(false);
    } catch (error) {
      console.error('Error fetching device tags:', error);
      setTagsLoading(false);
    }
  };

  const handleAddTagToDevice = async (deviceId, tagId) => {
    try {
      await axios.post(`/api/devices/${deviceId}/tags/${tagId}`);
      // Refresh device tags
      fetchDeviceTags(deviceId);
    } catch (error) {
      console.error('Error adding tag to device:', error);
      alert('Error adding tag to device. Please try again.');
    }
  };

  const handleRemoveTagFromDevice = async (deviceId, tagId) => {
    try {
      await axios.delete(`/api/devices/${deviceId}/tags/${tagId}`);
      // Refresh device tags
      fetchDeviceTags(deviceId);
    } catch (error) {
      console.error('Error removing tag from device:', error);
      alert('Error removing tag from device. Please try again.');
    }
  };

  const handleOpenDetailsModal = (device) => {
    setSelectedDevice(device);
    if (device && device.id) {
      fetchDeviceDetail(device.id);
    }
    setOpenDetailsModal(true);
    setDetailsTabValue(0); // Reset to first tab

    // Reset metrics state
    setCpuMetrics([]);
    setMemoryMetrics([]);
    setDiskMetrics([]);
    setMetricsError(null);

    // Reset jobs state
    setSelfHealingJobs([]);
    setJobsError(null);
    setJobExecutions({});
    setExecutionsLoading(false);
    setExecutionsError(null);

    // Reset monitoring policies state
    setMonitoringPolicies([]);
    setPoliciesLoading(false);
    setPoliciesError(null);
    setPolicyExecutions({});
    setPolicyExecutionsLoading(false);

    // Reset tags state
    setDeviceTags([]);
    setSelectedTag(null);

    // Fetch metrics data for the selected device
    if (device && device.id) {
      fetchDeviceMetrics(device.id, 'cpu');
      fetchDeviceMetrics(device.id, 'memory');
      fetchDeviceMetrics(device.id, 'disk');
      fetchSelfHealingJobs(device.id);
      fetchMonitoringPolicies(device.id);
      fetchDeviceTags(device.id);
      fetchAllTags(); // Fetch all available tags
    }
  };

  const handleTabChange = (event, newValue) => {
    setDetailsTabValue(newValue);

    // If switching to the monitoring scripts tab, fetch job executions and monitoring policies
    if (newValue === 4 && selectedDevice && selectedDevice.id) {
      fetchSelfHealingJobs(selectedDevice.id);
      fetchMonitoringPolicies(selectedDevice.id);
    }
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedDevice(null);
    setDeviceDetailsLoading(false);

    // Clear metrics data
    setCpuMetrics([]);
    setMemoryMetrics([]);
    setDiskMetrics([]);

    // Clear job executions data
    setSelfHealingJobs([]);
    setJobExecutions({});
    setExecutionsLoading(false);
    setExecutionsError(null);

    // Clear monitoring policies data
    setMonitoringPolicies([]);
    setPoliciesLoading(false);
    setPoliciesError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDevice({
      ...currentDevice,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setCurrentDevice({
      ...currentDevice,
      [name]: checked
    });
  };

  const handleSaveDevice = async () => {
    try {
      // For new devices, validate all required fields
      if (!currentDevice.id && (!currentDevice.name || !currentDevice.device_name || !currentDevice.company_id)) {
        alert('Name, Device Name, and Company are required');
        return;
      }

      // For existing devices, only company_id is required
      if (currentDevice.id && !currentDevice.company_id) {
        alert('Company is required');
        return;
      }

      // Save the device to the API
      if (currentDevice.id) {
        // Update existing device - only send editable fields
        const editableFields = {
          company_id: currentDevice.company_id,
          profile_id: currentDevice.profile_id,
          description: currentDevice.description
        };
        await axios.put(`/api/devices/${currentDevice.id}`, editableFields);
      } else {
        // Add new device - send all fields
        await axios.post('/api/devices', currentDevice);
      }

      // Refresh the device list
      await fetchDevices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving device:', error);
      alert('Error saving device. Please try again.');
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        // Delete the device from the API
        await axios.delete(`/api/devices/${id}`);

        // Refresh the device list
        await fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Error deleting device. Please try again.');
      }
    }
  };

  const handleOpenDownloadDialog = () => {
    setDownloadCompanyId(companyId || '');
    setDownloadToken('');
    setDownloadUrl('');
    setDownloadExpiry(7);
    setActiveTab('create'); // Default to create tab
    setOpenDownloadDialog(true);
  };

  const handleCloseDownloadDialog = () => {
    setOpenDownloadDialog(false);
  };

  const handleDownloadsPageChange = (event, newPage) => {
    setDownloadsPage(newPage);
  };

  const handleDownloadsSearch = (event) => {
    setDownloadsSearchTerm(event.target.value);
  };

  const handleDownloadsSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchAgentDownloads(1, downloadsSearchTerm, downloadsCompanyFilter);
    }
  };

  const handleDownloadsCompanyFilterChange = (event) => {
    setDownloadsCompanyFilter(event.target.value);
    fetchAgentDownloads(1, downloadsSearchTerm, event.target.value);
  };

  const handleActiveTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateDownloadToken = async () => {
    try {
      if (!downloadCompanyId) {
        alert('Please select a company');
        return;
      }

      // Set token generating state to true
      setTokenGenerating(true);

      const response = await axios.post(`/api/companies/${downloadCompanyId}/agent-download`, null, {
        params: { expires_in_days: downloadExpiry }
      });

      setDownloadToken(response.data.download_token);
      setDownloadUrl(response.data.download_url);

      // Set token generating state back to false
      setTokenGenerating(false);
    } catch (error) {
      console.error('Error creating download token:', error);
      alert('Error creating download token. Please try again.');

      // Set token generating state back to false in case of error
      setTokenGenerating(false);
    }
  };

  const handleDownloadAgent = (url = downloadUrl) => {
    if (url) {
      setDownloadLoading(true);
      setDownloadProgress(0);

      // Ensure the URL is absolute by prepending the base URL if it's a relative path
      // First, make sure url is a string to avoid "startsWith is not a function" error
      const urlString = String(url);
      const absoluteUrl = urlString.startsWith('/') ? `${window.location.origin}${urlString}` : urlString;
      console.log('Using absolute URL for download:', absoluteUrl);

      // First, initiate the build process by making a HEAD request
      // This will trigger the server to start building the MSI if it hasn't already
      axios.head(absoluteUrl)
        .then(() => {
          console.log('Build process initiated');

          // Set initial progress to show build is starting
          setDownloadProgress(5);

          // Set up retry counter and max retries
          let retryCount = 0;
          const maxRetries = 30; // Maximum number of retries (30 * 2 seconds = 60 seconds max wait time)

          // Function to check if the file is ready by polling with HEAD requests
          const checkFileStatus = () => {
            // Check if we've exceeded the maximum number of retries
            if (retryCount >= maxRetries) {
              console.error('Maximum retries exceeded waiting for file to be ready');
              alert('The installer is taking too long to build. Please try again later.');
              setDownloadLoading(false);
              return;
            }

            retryCount++;

            axios.head(absoluteUrl, {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            })
              .then(response => {
                // Check if the response headers indicate the file is ready
                // We'll look for Content-Length to be significant (real MSI files are several MB)
                const contentLength = response.headers['content-length'];
                console.log(`File check attempt ${retryCount}/${maxRetries}: Content-Length = ${contentLength || 'unknown'}`);

                const isReady = contentLength && parseInt(contentLength) > 1000000; // More than 1MB

                if (isReady) {
                  console.log('File is ready for download, size:', contentLength);
                  setDownloadProgress(90); // Set to 90% when build is complete
                  startDownload();
                } else {
                  // File is still building, update progress and check again
                  // Increment progress to show build is ongoing (max 85% during build)
                  const progressIncrement = 80 / maxRetries; // Distribute progress from 5% to 85% over max retries
                  setDownloadProgress(prev => Math.min(85, 5 + (retryCount * progressIncrement)));
                  console.log(`File still building, checking again in 2 seconds (attempt ${retryCount}/${maxRetries})`);
                  setTimeout(checkFileStatus, 2000);
                }
              })
              .catch(error => {
                console.error(`Error checking file status (attempt ${retryCount}/${maxRetries}):`, error);

                // If we get a 404, the file might not be ready yet
                if (error.response && error.response.status === 404) {
                  console.log('File not found yet, still building...');
                  setTimeout(checkFileStatus, 3000);
                } 
                // If we get a 500, there might be an issue with the build process
                else if (error.response && error.response.status === 500) {
                  console.error('Server error during build process');
                  alert('There was an error building the installer. Please try again.');
                  setDownloadLoading(false);
                }
                // For other errors, try again after a delay
                else {
                  setTimeout(checkFileStatus, 3000);
                }
              });
          };

          // Start the polling process
          checkFileStatus();
        })
        .catch(error => {
          console.error('Error initiating build process:', error);

          // Provide more specific error messages based on the error type
          if (error.response) {
            if (error.response.status === 404) {
              alert('The download URL is invalid. Please generate a new token and try again.');
            } else if (error.response.status === 500) {
              alert('The server encountered an error preparing the download. Please try again later.');
            } else {
              alert(`Error preparing download (HTTP ${error.response.status}). Please try again.`);
            }
          } else if (error.request) {
            alert('No response from server. Please check your network connection and try again.');
          } else {
            alert('Error preparing download. Please try again.');
          }

          setDownloadLoading(false);
        });

      // Function to start the actual download once the file is ready
      const startDownload = () => {
        console.log('Starting download');

        // Use axios to fetch the file
        axios({
          url: absoluteUrl,
          method: 'GET',
          responseType: 'blob', // Important for handling binary files
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 60000, // 60 second timeout for the download
          onDownloadProgress: (progressEvent) => {
            // Calculate and update progress percentage (from 90% to 100%)
            if (progressEvent.total) {
              const downloadPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // Scale download progress from 90-100%
              const scaledProgress = 90 + (downloadPercent * 0.1);
              setDownloadProgress(Math.min(100, scaledProgress));
            }
            console.log('Download progress:', progressEvent);
          }
        })
        .then(response => {
          // Check if we got a valid blob response
          if (response.data.size === 0) {
            console.error('Downloaded file is empty');
            alert('The downloaded file is empty. Please try again.');
            setDownloadLoading(false);
            return;
          }

          // Create a blob URL for the file
          const blob = new Blob([response.data]);
          const downloadUrl = window.URL.createObjectURL(blob);

          // Create a temporary link element to trigger the download
          const link = document.createElement('a');
          link.href = downloadUrl;

          // Extract filename from Content-Disposition header if available
          const contentDisposition = response.headers['content-disposition'];
          let filename = 'rabbitai-agent.msi';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].trim();
              console.log(`Using filename from Content-Disposition: ${filename}`);
            }
          } else {
            console.log('No Content-Disposition header found, using default filename');
          }

          link.setAttribute('download', filename);
          document.body.appendChild(link);

          // Log before clicking to help diagnose issues
          console.log(`Triggering download with filename: ${filename}, blob size: ${blob.size} bytes`);

          // Click the link to start the download
          link.click();

          // Clean up
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(link);
          setDownloadProgress(100);
          setDownloadLoading(false);
        })
        .catch(error => {
          console.error('Error downloading agent:', error);

          // Provide more specific error messages based on the error type
          if (error.response) {
            if (error.response.status === 404) {
              alert('The installer file was not found. It may have been removed or expired. Please generate a new token and try again.');
            } else if (error.response.status === 500) {
              alert('The server encountered an error serving the download. Please try again later.');
            } else {
              alert(`Error downloading agent (HTTP ${error.response.status}). Please try again.`);
            }
          } else if (error.request) {
            alert('No response from server during download. Please check your network connection and try again.');
          } else if (error.code === 'ECONNABORTED') {
            alert('The download timed out. Please try again later when the server is less busy.');
          } else {
            alert('Error downloading agent. Please try again.');
          }

          setDownloadLoading(false);
        });
      };
    }
  };

  if (loading && devices.length === 0) {
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
          {companyId ? 'Company Devices' : 'All Devices'}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New Device
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleOpenDownloadDialog}
            sx={{ mr: 2 }}
          >
            Download Agent
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDevices}
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
                placeholder="Search devices..."
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
                {!companyId && (
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Company</InputLabel>
                      <Select
                        name="company_id"
                        value={filters.company_id}
                        onChange={handleFilterChange}
                        label="Company"
                      >
                        <MenuItem value="">All</MenuItem>
                        {companies.map(company => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.CompanyName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Profile</InputLabel>
                    <Select
                      name="profile_id"
                      value={filters.profile_id}
                      onChange={handleFilterChange}
                      label="Profile"
                    >
                      <MenuItem value="">All</MenuItem>
                      {profiles.map(profile => (
                        <MenuItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="is_active"
                      value={filters.is_active}
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Health Status</InputLabel>
                    <Select
                      name="health_status"
                      value={filters.health_status}
                      onChange={handleFilterChange}
                      label="Health Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Healthy">Healthy</MenuItem>
                      <MenuItem value="Warning">Warning</MenuItem>
                      <MenuItem value="Error">Error</MenuItem>
                      <MenuItem value="Unknown">Unknown</MenuItem>
                    </Select>
                  </FormControl>
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
              <TableCell>Name</TableCell>
              <TableCell>Device Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Operating System</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Health Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length > 0 ? (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { 
                          textDecoration: 'underline',
                          color: 'primary.main'
                        } 
                      }}
                      onClick={() => handleOpenDetailsModal(device)}
                    >
                      {device.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{device.device_name}</TableCell>
                  <TableCell>{device.company_name || 'N/A'}</TableCell>
                  <TableCell>{device.operating_system || 'N/A'}</TableCell>
                  <TableCell>{device.ipv4_address || 'N/A'}</TableCell>
                  <TableCell>{getHealthStatusChip(device.health_status)}</TableCell>
                  <TableCell>{getStatusChip(device.is_active)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(device)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteDevice(device.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No devices found
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
            Showing {devices.length} of {totalItems} devices
          </Typography>
        </Stack>
      </Box>

      {/* Device Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentDevice.id ? 'Edit Device' : 'New Device'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {!currentDevice.id && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={currentDevice.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Device Name"
                  name="device_name"
                  value={currentDevice.device_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </>
            )}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Company</InputLabel>
              <Select
                name="company_id"
                value={currentDevice.company_id || ''}
                onChange={handleInputChange}
                label="Company"
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Profile</InputLabel>
              <Select
                name="profile_id"
                value={currentDevice.profile_id || ''}
                onChange={handleInputChange}
                label="Profile"
              >
                <MenuItem value="">None</MenuItem>
                {profiles.map(profile => (
                  <MenuItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentDevice.description || ''}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Enter a description for this device"
            />
            {currentDevice.id && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Note: Only company, profile, and description can be edited. Other device information is automatically updated by the agent.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveDevice} 
            variant="contained" 
            color="primary"
            disabled={
              !currentDevice.company_id || 
              (!currentDevice.id && (!currentDevice.name || !currentDevice.device_name))
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Agent Dialog */}
      <Dialog open={openDownloadDialog} onClose={handleCloseDownloadDialog} maxWidth="md" fullWidth>
        <DialogTitle>Agent Downloads</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleActiveTabChange} aria-label="agent download tabs">
              <Tab label="Create New Download" value="create" />
              <Tab label="Existing Downloads" value="list" />
            </Tabs>
          </Box>

          {/* Create New Download Tab */}
          {activeTab === 'create' && (
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                fullWidth
                options={companies}
                getOptionLabel={(option) => option.CompanyName || ''}
                value={companies.find(company => company.id === downloadCompanyId) || null}
                onChange={(event, newValue) => {
                  setDownloadCompanyId(newValue ? newValue.id : '');
                }}
                disabled={!!companyId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Company"
                    margin="normal"
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.CompanyName}
                  </li>
                )}
              />
              <TextField
                fullWidth
                label="Expiry (days)"
                type="number"
                value={downloadExpiry}
                onChange={(e) => setDownloadExpiry(e.target.value)}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 30 } }}
              />
              {downloadToken && (
                <>
                  <TextField
                    fullWidth
                    label="Download Token"
                    value={downloadToken}
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    This token will expire in {downloadExpiry} days. Use the button below to download the agent.
                  </Typography>
                </>
              )}

              {downloadLoading && (
                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {downloadProgress === 0 ? "Preparing download..." :
                     downloadProgress < 10 ? "Starting MSI build process..." :
                     downloadProgress < 90 ? `Building custom MSI installer: ${downloadProgress}%` :
                     downloadProgress < 100 ? `Downloading MSI: ${Math.round((downloadProgress - 90) * 10)}%` :
                     "Download complete!"}
                  </Typography>
                  {downloadProgress > 0 ? (
                    <LinearProgress variant="determinate" value={downloadProgress} />
                  ) : (
                    <LinearProgress variant="indeterminate" />
                  )}
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                {!downloadToken ? (
                  <Button 
                    onClick={handleCreateDownloadToken} 
                    variant="contained" 
                    color="primary"
                    disabled={!downloadCompanyId || tokenGenerating}
                    startIcon={tokenGenerating ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {tokenGenerating ? "Building MSI..." : "Generate Download"}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleDownloadAgent(downloadUrl)} 
                    variant="contained" 
                    color="primary"
                    startIcon={downloadLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? 
                      (downloadProgress < 90 ? "Building MSI..." : "Downloading...") 
                      : "Download Agent"}
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Existing Downloads Tab */}
          {activeTab === 'list' && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search downloads..."
                    value={downloadsSearchTerm}
                    onChange={handleDownloadsSearch}
                    onKeyPress={handleDownloadsSearchKeyPress}
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
                  <Autocomplete
                    fullWidth
                    options={[{ id: '', CompanyName: 'All Companies' }, ...companies]}
                    getOptionLabel={(option) => option.CompanyName || ''}
                    value={
                      downloadsCompanyFilter === '' 
                        ? { id: '', CompanyName: 'All Companies' } 
                        : companies.find(company => company.id === downloadsCompanyFilter) || null
                    }
                    onChange={(event, newValue) => {
                      const newCompanyId = newValue ? newValue.id : '';
                      setDownloadsCompanyFilter(newCompanyId);
                      fetchAgentDownloads(1, downloadsSearchTerm, newCompanyId);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filter by Company"
                        margin="normal"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id || 'all'}>
                        {option.CompanyName}
                      </li>
                    )}
                  />
                </Grid>
              </Grid>

              {downloadsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Expires</TableCell>
                          <TableCell>Downloads</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {downloads.length > 0 ? (
                          downloads.map((download) => (
                            <TableRow key={download.id}>
                              <TableCell>{download.company_name}</TableCell>
                              <TableCell>{new Date(download.created_at).toLocaleString()}</TableCell>
                              <TableCell>{new Date(download.expires_at).toLocaleString()}</TableCell>
                              <TableCell>{download.download_count}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {downloadLoading ? (
                                    <Box sx={{ width: '200px', mr: 1 }}>
                                      <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                        {downloadProgress === 0 ? "Preparing..." :
                                         downloadProgress < 10 ? "Starting build..." :
                                         downloadProgress < 90 ? `Building: ${downloadProgress}%` :
                                         downloadProgress < 100 ? `Downloading: ${Math.round((downloadProgress - 90) * 10)}%` :
                                         "Complete!"}
                                      </Typography>
                                      {downloadProgress > 0 ? (
                                        <LinearProgress variant="determinate" value={downloadProgress} />
                                      ) : (
                                        <LinearProgress variant="indeterminate" />
                                      )}
                                    </Box>
                                  ) : null}
                                  <Tooltip title={
                                    downloadLoading ? 
                                      (downloadProgress < 90 ? "Building custom MSI installer..." : "Downloading agent...") 
                                      : "Download Agent"
                                  }>
                                    <span>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleDownloadAgent(download.download_url)}
                                        disabled={downloadLoading}
                                      >
                                        {downloadLoading ? 
                                          <CircularProgress size={16} /> : 
                                          <DownloadIcon fontSize="small" />
                                        }
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No downloads found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination controls */}
                  {downloadsTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Stack spacing={2}>
                        <Pagination 
                          count={downloadsTotalPages} 
                          page={downloadsPage} 
                          onChange={handleDownloadsPageChange} 
                          color="primary" 
                          showFirstButton 
                          showLastButton
                        />
                        <Typography variant="body2" color="text.secondary" align="center">
                          Showing {downloads.length} of {downloadsTotalItems} downloads
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDownloadDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Device Details Modal */}
      <Dialog open={openDetailsModal} onClose={handleCloseDetailsModal} maxWidth="lg" fullWidth>
        {selectedDevice && (
          <>
            <DialogTitle>
              <Typography variant="h6">Device Details: {selectedDevice.name}</Typography>
            </DialogTitle>
            <DialogContent sx={{ height: '70vh', overflow: 'auto' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={detailsTabValue} onChange={handleTabChange} aria-label="device details tabs">
                  <Tab label="Overview" />
                  <Tab label="System Info" />
                  <Tab label="Hardware" />
                  <Tab label="Performance" />
                  <Tab label="Monitoring Scripts" />
                  <Tab label="Applications" />
                  <Tab label="Services" />
                  <Tab label="State" />
                </Tabs>
                {deviceDetailsLoading && <LinearProgress sx={{ mt: 1 }} />}
              </Box>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 0 ? 'flex' : 'none' }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Device Name</Typography>
                  <Typography variant="body1">{selectedDevice.device_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                  <Typography variant="body1">{selectedDevice.company_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Profile</Typography>
                  <Typography variant="body1">{selectedDevice.profile_name || 'None'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedDevice.description || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">Tags</Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        value={selectedTag || ''}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        displayEmpty
                        size="small"
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em>Add a tag</em>;
                          }
                          const tag = allTags.find(t => t.id === selected);
                          return tag ? tag.name : '';
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Add a tag</em>
                        </MenuItem>
                        {allTags
                          .filter(tag => !deviceTags.some(dt => dt.id === tag.id))
                          .map((tag) => (
                            <MenuItem key={tag.id} value={tag.id}>
                              {tag.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!selectedTag}
                      onClick={() => {
                        handleAddTagToDevice(selectedDevice.id, selectedTag);
                        setSelectedTag(null);
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  {tagsLoading ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : deviceTags.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No tags assigned to this device
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {deviceTags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          icon={<LabelIcon />}
                          onDelete={() => handleRemoveTagFromDevice(selectedDevice.id, tag.id)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 1 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>System Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Operating System</Typography>
                  <Typography variant="body1">{selectedDevice.operating_system || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">IP Address</Typography>
                  <Typography variant="body1">{selectedDevice.ipv4_address || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Logged On User</Typography>
                  <Typography variant="body1">{selectedDevice.last_logged_on_user || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Antivirus Product</Typography>
                  <Typography variant="body1">{selectedDevice.antivirus_product || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Antivirus Status</Typography>
                  <Typography variant="body1">{selectedDevice.antivirus_status || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Reboot</Typography>
                  <Typography variant="body1">
                    {selectedDevice.last_reboot ? new Date(selectedDevice.last_reboot).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Seen</Typography>
                  <Typography variant="body1">
                    {selectedDevice.last_seen ? new Date(selectedDevice.last_seen).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Health Status</Typography>
                  <Box sx={{ mt: 0.5 }}>{getHealthStatusChip(selectedDevice.health_status)}</Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedDevice.is_active)}</Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Patch Status</Typography>
                  <Typography variant="body1">{selectedDevice.patch_status || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Reboot Required</Typography>
                  <Typography variant="body1">
                    {selectedDevice.reboot_required === true ? 'Yes' : 
                     selectedDevice.reboot_required === false ? 'No' : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 2 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Hardware Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                  <Typography variant="body1">{selectedDevice.manufacturer_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Model</Typography>
                  <Typography variant="body1">{selectedDevice.device_model_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body1">{selectedDevice.serial_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Warranty Date</Typography>
                  <Typography variant="body1">
                    {selectedDevice.warranty_date ? new Date(selectedDevice.warranty_date).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">CPU</Typography>
                  <Typography variant="body1">{selectedDevice.cpu_info || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">CPU Usage</Typography>
                  <Typography variant="body1">
                    {selectedDevice.cpu_usage !== null && selectedDevice.cpu_usage !== undefined ? 
                      `${selectedDevice.cpu_usage}%` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Memory</Typography>
                  <Typography variant="body1">
                    {selectedDevice.total_memory ? `${selectedDevice.total_memory} MB` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Available Memory</Typography>
                  <Typography variant="body1">
                    {selectedDevice.available_memory ? `${selectedDevice.available_memory} MB` : 'N/A'}
                  </Typography>
                </Grid>
                {selectedDevice.disk_info && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Disk Information</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Drive</TableCell>
                            <TableCell>Volume Name</TableCell>
                            <TableCell>Size (GB)</TableCell>
                            <TableCell>Free Space (GB)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(() => {
                            try {
                              const disks = JSON.parse(selectedDevice.disk_info);
                              if (Array.isArray(disks)) {
                                return disks.map((disk, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{disk.drive || 'N/A'}</TableCell>
                                    <TableCell>{disk.volume_name || 'N/A'}</TableCell>
                                    <TableCell>{disk.size_gb || 'N/A'}</TableCell>
                                    <TableCell>{disk.free_space_gb || 'N/A'}</TableCell>
                                  </TableRow>
                                ));
                              } else {
                                return (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">Invalid disk information format</TableCell>
                                  </TableRow>
                                );
                              }
                            } catch (error) {
                              console.error("Error parsing disk info:", error);
                              return (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">Error parsing disk information</TableCell>
                                </TableRow>
                              );
                            }
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>


              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 3 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Performance Metrics (Last 24 Hours)</Typography>
                </Grid>

                {/* CPU Usage Chart */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">CPU Usage (%)</Typography>
                  {metricsLoading && cpuMetrics.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : metricsError ? (
                    <Typography color="error" variant="body2">{metricsError}</Typography>
                  ) : cpuMetrics.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No CPU metrics data available</Typography>
                  ) : (
                    <Box sx={{ height: 200, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={cpuMetrics}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            label={{ value: 'CPU %', angle: -90, position: 'insideLeft' }}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value}%`, 'CPU Usage']}
                            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            name="CPU Usage"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Grid>

                {/* Memory Usage Chart */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Memory Usage (%)</Typography>
                  {metricsLoading && memoryMetrics.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : metricsError ? (
                    <Typography color="error" variant="body2">{metricsError}</Typography>
                  ) : memoryMetrics.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No memory metrics data available</Typography>
                  ) : (
                    <Box sx={{ height: 200, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={memoryMetrics}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            label={{ value: 'Memory %', angle: -90, position: 'insideLeft' }}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value}%`, 'Memory Usage']}
                            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#82ca9d" 
                            activeDot={{ r: 8 }} 
                            name="Memory Usage"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Grid>

                {/* Disk Usage Chart */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Disk Usage (%)</Typography>
                  {metricsLoading && diskMetrics.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : metricsError ? (
                    <Typography color="error" variant="body2">{metricsError}</Typography>
                  ) : diskMetrics.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No disk metrics data available</Typography>
                  ) : (
                    <Box sx={{ height: 200, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            label={{ value: 'Disk %', angle: -90, position: 'insideLeft' }}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value}%`, 'Disk Usage']}
                            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                          />
                          <Legend />
                          {diskMetrics.map((drive, index) => (
                            <Line 
                              key={drive.drive}
                              data={drive.data_points}
                              type="monotone" 
                              dataKey="value" 
                              name={drive.drive}
                              stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'][index % 5]} 
                              activeDot={{ r: 8 }} 
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Grid>

              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 0 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>Agent Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Agent Version</Typography>
                  <Typography variant="body1">{selectedDevice.agent_version || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Agent Installed Date</Typography>
                  <Typography variant="body1">
                    {selectedDevice.agent_installed_date ? new Date(selectedDevice.agent_installed_date).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                {selectedDevice.health_logs && selectedDevice.health_logs.length > 0 && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>Recent Health Logs</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Message</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedDevice.health_logs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                <TableCell>{getHealthStatusChip(log.health_status)}</TableCell>
                                <TableCell>{log.message || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </>
                )}
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 4 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Monitoring Scripts</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These scripts automatically monitor and fix issues on this device.
                  </Typography>
                </Grid>

                {/* Self-Healing Jobs Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Self-Healing Jobs</Typography>
                </Grid>

                {jobsLoading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  </Grid>
                ) : jobsError ? (
                  <Grid item xs={12}>
                    <Typography color="error" variant="body2">{jobsError}</Typography>
                  </Grid>
                ) : selfHealingJobs.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">No self-healing jobs assigned to this device.</Typography>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Last Run</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selfHealingJobs.map((job) => (
                            <React.Fragment key={job.id}>
                              <TableRow>
                                <TableCell>{job.name}</TableCell>
                                <TableCell>{job.description || 'N/A'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label={job.severity} 
                                    color={
                                      job.severity === 'critical' ? 'error' : 
                                      job.severity === 'high' ? 'warning' : 
                                      job.severity === 'medium' ? 'info' : 'default'
                                    }
                                  />
                                </TableCell>
                                <TableCell>{job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label={job.is_active ? 'Enabled' : 'Disabled'} 
                                    color={job.is_active ? 'success' : 'default'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    size="small"
                                    checked={job.is_active}
                                    onChange={() => toggleJobStatus(job.id, job.is_active)}
                                    color="primary"
                                  />
                                </TableCell>
                              </TableRow>

                              {/* Execution History */}
                              <TableRow>
                                <TableCell colSpan={6} sx={{ py: 0 }}>
                                  <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Last 10 Execution Results
                                    </Typography>

                                    {executionsLoading ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                      </Box>
                                    ) : executionsError ? (
                                      <Typography color="error" variant="body2">{executionsError}</Typography>
                                    ) : !jobExecutions[job.id] || jobExecutions[job.id].length === 0 ? (
                                      <Typography variant="body2" color="text.secondary">
                                        No execution history available for this script.
                                      </Typography>
                                    ) : (
                                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
                                        <Table size="small" stickyHeader>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Date</TableCell>
                                              <TableCell>Phase</TableCell>
                                              <TableCell>Status</TableCell>
                                              <TableCell>Result</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {jobExecutions[job.id].map((execution) => (
                                              <TableRow key={execution.id}>
                                                <TableCell>
                                                  {execution.started_at ? new Date(execution.started_at).toLocaleString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                  <Chip 
                                                    size="small" 
                                                    label={execution.execution_phase} 
                                                    color={
                                                      execution.execution_phase === 'detection' ? 'primary' : 
                                                      execution.execution_phase === 'remediation' ? 'warning' : 
                                                      execution.execution_phase === 'verification' ? 'info' : 'default'
                                                    }
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <Chip 
                                                    size="small" 
                                                    label={execution.status} 
                                                    color={
                                                      execution.status === 'completed' ? 'success' : 
                                                      execution.status === 'failed' ? 'error' : 
                                                      execution.status === 'running' ? 'warning' : 'default'
                                                    }
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  {execution.error_message ? (
                                                    <Tooltip title={execution.error_message}>
                                                      <span>Error (hover for details)</span>
                                                    </Tooltip>
                                                  ) : execution.result ? (
                                                    <Tooltip title={JSON.stringify(execution.result, null, 2)}>
                                                      <span>Success (hover for details)</span>
                                                    </Tooltip>
                                                  ) : 'N/A'}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}

                {/* Monitoring Policies Section */}
                <Grid item xs={12} sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Monitoring Policies</Typography>
                </Grid>

                {policiesLoading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  </Grid>
                ) : policiesError ? (
                  <Grid item xs={12}>
                    <Typography color="error" variant="body2">{policiesError}</Typography>
                  </Grid>
                ) : monitoringPolicies.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">No monitoring policies assigned to this device.</Typography>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Script</TableCell>
                            <TableCell>Schedule</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last 10 Jobs</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {monitoringPolicies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell>{policy.name}</TableCell>
                              <TableCell>{policy.description || 'N/A'}</TableCell>
                              <TableCell>{policy.script_name}</TableCell>
                              <TableCell>{policy.schedule_type}</TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={policy.is_active ? 'Enabled' : 'Disabled'} 
                                  color={policy.is_active ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {policyExecutionsLoading ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <JobTallyMarks executions={policyExecutions[policy.id] || []} />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 5 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Applications</Typography>
                </Grid>

                <Grid item xs={12}>
                  {selectedDevice?.actual_state?.installed_programs ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(() => {
                            try {
                              const apps = JSON.parse(selectedDevice.actual_state.installed_programs);
                              if (Array.isArray(apps)) {
                                return apps.map((app, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{app.name || 'N/A'}</TableCell>
                                    <TableCell>{app.version || 'N/A'}</TableCell>
                                  </TableRow>
                                ));
                              }
                              return (
                                <TableRow>
                                  <TableCell colSpan={2} align="center">Invalid data</TableCell>
                                </TableRow>
                              );
                            } catch (error) {
                              console.error('Error parsing installed programs:', error);
                              return (
                                <TableRow>
                                  <TableCell colSpan={2} align="center">Error parsing data</TableCell>
                                </TableRow>
                              );
                            }
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No application data available.</Typography>
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 6 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Services</Typography>
                </Grid>

                <Grid item xs={12}>
                  {selectedDevice?.actual_state?.running_services ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(() => {
                            try {
                              const svcs = JSON.parse(selectedDevice.actual_state.running_services);
                              if (Array.isArray(svcs)) {
                                return svcs.map((svc, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{svc.name || 'N/A'}</TableCell>
                                    <TableCell>{svc.status || 'N/A'}</TableCell>
                                  </TableRow>
                                ));
                              }
                              return (
                                <TableRow>
                                  <TableCell colSpan={2} align="center">Invalid data</TableCell>
                                </TableRow>
                              );
                            } catch (error) {
                              console.error('Error parsing running services:', error);
                              return (
                                <TableRow>
                                  <TableCell colSpan={2} align="center">Error parsing data</TableCell>
                                </TableRow>
                              );
                            }
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No service data available.</Typography>
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, display: detailsTabValue === 7 ? 'flex' : 'none' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>State Information</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Actual State</Typography>
                  {selectedDevice?.actual_state ? (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedDevice.actual_state, null, 2)}
                    </pre>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No actual state recorded.</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Desired State</Typography>
                  {selectedDevice?.desired_state && selectedDevice.desired_state.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Expected</TableCell>
                            <TableCell>Severity</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDevice.desired_state.map((ds, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{ds.config_key}</TableCell>
                              <TableCell>{ds.expected_value}</TableCell>
                              <TableCell>{ds.severity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No desired state defined.</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Drift</Typography>
                  {selectedDevice?.drift && selectedDevice.drift.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Expected</TableCell>
                            <TableCell>Actual</TableCell>
                            <TableCell>Timestamp</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDevice.drift.map((df, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{df.config_key}</TableCell>
                              <TableCell>{df.expected_value}</TableCell>
                              <TableCell>{df.actual_value}</TableCell>
                              <TableCell>{new Date(df.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No drift detected.</Typography>
                  )}
                </Grid>
              </Grid>

            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseDetailsModal();
                  handleOpenDialog(selectedDevice);
                }}
              >
                Edit
              </Button>
              <Button onClick={handleCloseDetailsModal}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
