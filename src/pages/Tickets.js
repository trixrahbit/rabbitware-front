import React, { useState, useEffect, useRef } from 'react';
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
  ListSubheader,
  Grid,
  Pagination,
  Divider,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ResolvedIcon,
  Error as OpenIcon,
  Warning as PendingIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import SlaTracker from '../components/SlaTracker';
import { useSettingsTimezone } from '../hooks/useTimezone';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState({
    id: null,
    ticketNumber: '',
    title: '',
    description: '',
    status: 1,
    priority: 1,
    assignedResourceID: null,
    companyID: null,
    contactID: null,
    ticketCategory: 1,
    ticketType: 1,
    issueType: 0,
    subIssueType: null,
    source: 8, // Default to Web Portal
    dueDateTime: null,
    contractID: null
  });
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [ticketComments, setTicketComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const { formatDate } = useSettingsTimezone();
  const [commentType, setCommentType] = useState('internal'); // 'internal' or 'external'
  const [resources, setResources] = useState([]);

  // State variables for ticket field options
  const [queues, setQueues] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [subIssueTypes, setSubIssueTypes] = useState([]);
  const [sources, setSources] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketStatuses, setTicketStatuses] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    status: [1, 2, 7, 11], // Default to "All but completed" (excluding status 5)
    priority: '',
    assignedResourceID: '',
    companyID: '',
    queueID: '',
    createdAfter: null,
    createdBefore: null,
    ticketNumber: ''
  });

  // State for search terms
  const [statusSearchTerm, setStatusSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [editStatusSearchTerm, setEditStatusSearchTerm] = useState('');
  const [editCompanySearchTerm, setEditCompanySearchTerm] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  useEffect(() => {
    // Fetch tickets first
    fetchTickets();

    // Fetch all dropdown options in parallel for better performance
    Promise.all([
      fetchResources(),
      fetchCompanies(),
      fetchQueues(),
      fetchIssueTypes(),
      fetchSubIssueTypes(),
      fetchSources(),
      fetchContracts(),
      fetchTicketCategories(),
      fetchTicketTypes(),
      fetchTicketStatuses()
    ]).catch(error => {
      console.error('Error fetching dropdown options:', error);
    });
  }, []);

  // Refetch tickets when page, pageSize, or filters change
  useEffect(() => {
    fetchTickets();
  }, [page, pageSize]);

  // We no longer automatically apply filters when they change
  // Instead, we'll wait for the user to click the Apply Filters button
  const isInitialRender = useRef(true);
  const prevFiltersRef = useRef(filters);

  useEffect(() => {
    // Skip the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevFiltersRef.current = filters;
      return;
    }

    // Just update the previous filters reference without applying filters
    prevFiltersRef.current = filters;
    console.log('Filters changed, waiting for user to apply');
  }, [filters]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    // Special handling for multi-select status
    if (name === 'status') {
      setFilters(prev => ({
        ...prev,
        [name]: typeof value === 'string' ? value.split(',') : value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle status search
  const handleStatusSearch = (event) => {
    setStatusSearchTerm(event.target.value);
  };

  // Handle company search
  const handleCompanySearch = (event) => {
    setCompanySearchTerm(event.target.value);
  };

  // Handle edit status search
  const handleEditStatusSearch = (event) => {
    setEditStatusSearchTerm(event.target.value);
  };

  // Handle edit company search
  const handleEditCompanySearch = (event) => {
    setEditCompanySearchTerm(event.target.value);
  };

  // Handle contact search
  const handleContactSearch = (event) => {
    setContactSearchTerm(event.target.value);
  };

  // Handle date filter change
  const handleDateFilterChange = (name, date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchTickets(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: [1, 2, 7, 11], // Reset to "All but completed" (excluding status 5)
      priority: '',
      assignedResourceID: '',
      companyID: '',
      queueID: '',
      createdAfter: null,
      createdBefore: null,
      ticketNumber: ''
    });
    setSearchTerm('');
    setPage(1);
    fetchTickets(1);
  };

  const fetchResources = async (selectedId = null) => {
    try {
      setLoading(true);
      // Fetch resources from the API, optionally with a selected ID
      let url = '/api/autotask/resources';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Resources response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setResources(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setResources(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      // Fetch companies from the API using the new endpoint for all companies
      const response = await axios.get('/api/companies/all');
      console.log('Companies response:', response.data);
      // The new endpoint returns an array of companies directly
      if (Array.isArray(response.data)) {
        setCompanies(response.data);
      } else {
        // Fallback to the old endpoint format if needed
        if (response.data && response.data.companies) {
          setCompanies(response.data.companies);
        } else {
          // Fallback to empty array if the expected structure is not found
          setCompanies([]);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setCompanies([]);
    }
  };

  const fetchContacts = async (companyId) => {
    if (!companyId) {
      console.log('No company ID provided for fetching contacts');
      setContacts([]);
      return [];
    }

    try {
      // Fetch contacts for the selected company
      console.log(`Fetching contacts for company ID: ${companyId}`);

      // Ensure companyId is a number
      const numericCompanyId = Number(companyId);
      if (isNaN(numericCompanyId)) {
        console.error(`Invalid company ID: ${companyId} is not a number`);
        setContacts([]);
        return [];
      }

      console.log(`Making API call to /api/companies/${numericCompanyId}/contacts`);
      const response = await axios.get(`/api/companies/${numericCompanyId}/contacts`);
      console.log('Contacts response:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Setting ${response.data.length} contacts in state`);
        setContacts(response.data);
        return response.data;
      } else {
        console.log('No contacts found or invalid response format');
        setContacts([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setContacts([]);
      return [];
    }
  };

  const fetchTicketComments = async (ticketId) => {
    if (!ticketId) {
      console.log('No ticket ID provided for fetching comments');
      setTicketComments([]);
      return;
    }

    try {
      // Fetch comments for the selected ticket
      console.log(`Fetching comments for ticket ID: ${ticketId}`);
      const response = await axios.get(`/api/tickets/${ticketId}/comments`);
      console.log('Comments response:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Setting ${response.data.length} comments in state`);
        setTicketComments(response.data);
      } else {
        console.log('No comments found or invalid response format');
        setTicketComments([]);
      }
    } catch (error) {
      console.error('Error fetching ticket comments:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setTicketComments([]);
    }
  };

  const fetchQueues = async (selectedId = null) => {
    try {
      // Fetch queues from the API, optionally with a selected ID
      let url = '/api/autotask/queues';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Queues response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setQueues(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setQueues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching queues:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setQueues([]);
    }
  };

  const fetchIssueTypes = async (selectedId = null) => {
    try {
      // Fetch issue types from the API, optionally with a selected ID
      let url = '/api/autotask/issue-types';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Issue types response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setIssueTypes(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setIssueTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching issue types:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setIssueTypes([]);
    }
  };

  const fetchSubIssueTypes = async (issueTypeId = null, selectedId = null) => {
    try {
      // Fetch sub-issue types from the API, optionally filtered by issue type and with a selected ID
      let url = '/api/autotask/sub-issue-types';
      const params = [];
      if (issueTypeId) {
        params.push(`issue_type_id=${issueTypeId}`);
      }
      if (selectedId) {
        params.push(`selected_id=${selectedId}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await axios.get(url);
      console.log('Sub-issue types response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setSubIssueTypes(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setSubIssueTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching sub-issue types:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setSubIssueTypes([]);
    }
  };

  const fetchSources = async (selectedId = null) => {
    try {
      // Fetch sources from the API, optionally with a selected ID
      let url = '/api/autotask/sources';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Sources response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setSources(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setSources(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setSources([]);
    }
  };

  const fetchContracts = async (selectedId = null) => {
    try {
      // Fetch contracts from the API, optionally with a selected ID
      let url = '/api/autotask/contracts';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Contracts response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setContracts(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setContracts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setContracts([]);
    }
  };

  const fetchTicketCategories = async (selectedId = null) => {
    try {
      // Fetch ticket categories from the API, optionally with a selected ID
      let url = '/api/autotask/ticket-categories';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Ticket categories response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setTicketCategories(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setTicketCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching ticket categories:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setTicketCategories([]);
    }
  };

  const fetchTicketTypes = async (selectedId = null) => {
    try {
      // Fetch ticket types from the API, optionally with a selected ID
      let url = '/api/autotask/ticket-types';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Ticket types response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setTicketTypes(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setTicketTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setTicketTypes([]);
    }
  };

  const fetchTicketStatuses = async (selectedId = null) => {
    try {
      // Fetch ticket statuses from the API, optionally with a selected ID
      let url = '/api/autotask/ticket-statuses';
      if (selectedId) {
        url += `?selected_id=${selectedId}`;
      }
      const response = await axios.get(url);
      console.log('Ticket statuses response:', response.data);

      // Handle the new response format (dictionary with selected and options properties)
      if (response.data && response.data.options) {
        setTicketStatuses(response.data.options || []);
      } else {
        // Fallback to the old format for backward compatibility
        setTicketStatuses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Set to empty array on error
      setTicketStatuses([]);
    }
  };

  const fetchTickets = async (newPage = page) => {
    try {
      setLoading(true);

      // Build query parameters for pagination and filtering
      const params = {
        page: newPage,
        page_size: pageSize
      };

      // Add filters to query parameters if they have values
      if (filters.status && filters.status.length > 0) {
        // For multi-select status, join the values with commas
        params.status = filters.status.join(',');
      }
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedResourceID) params.assigned_resource_id = filters.assignedResourceID;
      if (filters.companyID) params.company_id = filters.companyID;
      if (filters.queueID) params.queue_id = filters.queueID;
      if (filters.ticketNumber) params.ticket_number = filters.ticketNumber;

      // Format dates for API if they exist
      if (filters.createdAfter) {
        const formattedDate = filters.createdAfter.toISOString().split('T')[0];
        params.created_after = formattedDate;
      }

      if (filters.createdBefore) {
        const formattedDate = filters.createdBefore.toISOString().split('T')[0];
        params.created_before = formattedDate;
      }

      // Add search term if it exists
      if (searchTerm) params.search = searchTerm;

      // Fetch tickets from the API with query parameters
      const response = await axios.get('/api/tickets', { params });
      console.log('Tickets response:', response.data);

      // Handle the paginated response structure
      setTickets(response.data.tickets || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.pages || 0);
      // Don't update page state here to avoid infinite loop

      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
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

  const getStatusChip = (status, statusName) => {
    // Use status name if available
    if (statusName) {
      if (statusName.toLowerCase().includes('complete') || statusName.toLowerCase().includes('resolved')) {
        return <Chip icon={<ResolvedIcon />} label={statusName} color="success" size="small" />;
      } else if (statusName.toLowerCase().includes('progress') || statusName.toLowerCase().includes('waiting')) {
        return <Chip icon={<PendingIcon />} label={statusName} color="warning" size="small" />;
      } else {
        return <Chip icon={<OpenIcon />} label={statusName} color="error" size="small" />;
      }
    }

    // Fallback to status ID if name not available
    switch (status) {
      case 1: // New
      case 11: // Escalated
        return <Chip icon={<OpenIcon />} label="Open" color="error" size="small" />;
      case 2: // In Progress
      case 7: // Waiting Client
      case 24: // Client Responded
      case 41: // Waiting Vendor
        return <Chip icon={<PendingIcon />} label="In Progress" color="warning" size="small" />;
      case 5: // Completed
        return <Chip icon={<ResolvedIcon />} label="Resolved" color="success" size="small" />;
      default:
        return <Chip label={`Status ${status}`} size="small" />;
    }
  };

  const getPriorityChip = (priority, priorityName) => {
    // Use priority name if available
    if (priorityName) {
      if (priorityName.toLowerCase().includes('critical')) {
        return <Chip label={priorityName} color="error" size="small" />;
      } else if (priorityName.toLowerCase().includes('high')) {
        return <Chip label={priorityName} color="error" size="small" />;
      } else if (priorityName.toLowerCase().includes('medium')) {
        return <Chip label={priorityName} color="warning" size="small" />;
      } else if (priorityName.toLowerCase().includes('low')) {
        return <Chip label={priorityName} color="info" size="small" />;
      } else {
        return <Chip label={priorityName} size="small" />;
      }
    }

    // Fallback to priority ID if name not available
    switch (priority) {
      case 4: // Critical
        return <Chip label="Critical" color="error" size="small" />;
      case 1: // High
        return <Chip label="High" color="error" size="small" />;
      case 2: // Medium
        return <Chip label="Medium" color="warning" size="small" />;
      case 3: // Low
      case 5: // Very Low
        return <Chip label="Low" color="info" size="small" />;
      default:
        return <Chip label={`Priority ${priority}`} size="small" />;
    }
  };

  const handleOpenDialog = async (ticket = null) => {
    // Set initial state and open dialog immediately for better UX
    if (ticket) {
      // Create a minimal copy of the ticket for initial display
      const minimalTicketCopy = { 
        ...ticket,
        dueDateTime: ticket.dueDateTime ? new Date(ticket.dueDateTime) : null
      };

      console.log('Initial ticket data:', minimalTicketCopy);

      // Set the current ticket with minimal data to show something immediately
      setCurrentTicket(minimalTicketCopy);

      // If we have a company ID, fetch contacts immediately
      if (minimalTicketCopy.companyID) {
        console.log('Fetching contacts for initial company ID:', minimalTicketCopy.companyID);
        // Fetch contacts and store the promise to await it later
        const contactsPromise = fetchContacts(minimalTicketCopy.companyID);

        // If we also have a contactID, make sure it's valid after contacts are loaded
        if (minimalTicketCopy.contactID) {
          // Use the promise to validate the contactID
          contactsPromise.then(fetchedContacts => {
            const contactExists = fetchedContacts.some(contact => contact.id === minimalTicketCopy.contactID);
            if (!contactExists) {
              console.log(`Contact ID ${minimalTicketCopy.contactID} not found in fetched contacts, will try to fetch it again with full ticket data`);
            }
          });
        }
      }

      // Clear comments initially
      setTicketComments([]);

      // Open the dialog immediately
      setOpenDialog(true);

      // Set dialog loading state to true
      setDialogLoading(true);

      // Then fetch the full data in the background
      try {
        // Fetch the full ticket details from the API
        const response = await axios.get(`/api/tickets/${ticket.id}`);
        const fullTicketData = response.data;

        // Create a copy of the ticket with all the data from the API
        const ticketCopy = { ...fullTicketData };

        // Convert dueDateTime to a Date object if it exists, or set to null if invalid
        if (ticketCopy.dueDateTime) {
          try {
            // Try to parse the date string
            const parsedDate = new Date(ticketCopy.dueDateTime);
            // Check if the parsed date is valid
            if (!isNaN(parsedDate.getTime())) {
              ticketCopy.dueDateTime = parsedDate;
            } else {
              // If the date is invalid, set to null
              ticketCopy.dueDateTime = null;
            }
          } catch (error) {
            console.error('Error parsing dueDateTime:', error);
            ticketCopy.dueDateTime = null;
          }
        } else {
          // If dueDateTime is null, undefined, or empty string, set to null
          ticketCopy.dueDateTime = null;
        }

        // Log the ticket data to help with debugging
        console.log('Full ticket data from API:', ticketCopy);

        // Make sure all required fields are present
        // If any field is missing but exists in the database, add it with a default value
        const requiredFields = [
          { name: 'queueID', defaultValue: '' },
          { name: 'ticketCategory', defaultValue: 1 },
          { name: 'ticketType', defaultValue: 1 },
          { name: 'issueType', defaultValue: 0 },
          { name: 'subIssueType', defaultValue: null },
          { name: 'source', defaultValue: 8 },
          { name: 'contractID', defaultValue: null },
          { name: 'companyID', defaultValue: null },
          { name: 'contactID', defaultValue: null }
        ];

        for (const field of requiredFields) {
          if (!(field.name in ticketCopy)) {
            console.log(`${field.name} not found in ticket data, setting to default`);
            ticketCopy[field.name] = field.defaultValue;
          }
        }

        // Log the ticket data to help with debugging
        console.log('Setting current ticket with data:', ticketCopy);

        // Ensure critical fields are set
        if (!ticketCopy.companyID && ticket.companyID) {
          console.log(`companyID not found in API response, using original value: ${ticket.companyID}`);
          ticketCopy.companyID = ticket.companyID;
        }

        if (!ticketCopy.contactID && ticket.contactID) {
          console.log(`contactID not found in API response, using original value: ${ticket.contactID}`);
          ticketCopy.contactID = ticket.contactID;
        }

        if (!ticketCopy.issueType && ticket.issueType) {
          console.log(`issueType not found in API response, using original value: ${ticket.issueType}`);
          ticketCopy.issueType = ticket.issueType;
        }

        // Update the current ticket with the full data
        setCurrentTicket(ticketCopy);

        // If comments are included in the ticket data, use them
        if (ticketCopy.comments && ticketCopy.comments.length > 0) {
          console.log('Using comments from ticket data:', ticketCopy.comments);
          setTicketComments(ticketCopy.comments);
        } else {
          // Otherwise, fetch comments separately
          console.log('Fetching comments separately for ticket ID:', ticket.id);
          await fetchTicketComments(ticket.id);
        }

        // We only need to fetch contacts for the ticket's company
        // All other dropdown options are already fetched when the component mounts
        if (ticketCopy.companyID) {
          console.log('Fetching contacts for company ID:', ticketCopy.companyID);
          const fetchedContacts = await fetchContacts(ticketCopy.companyID);

          // If we have a contactID, make sure it's valid
          if (ticketCopy.contactID) {
            const contactExists = fetchedContacts.some(contact => contact.id === ticketCopy.contactID);
            if (!contactExists) {
              console.log(`Contact ID ${ticketCopy.contactID} not found in fetched contacts, checking if it exists in the database`);

              // If the contact doesn't exist in the fetched contacts, try to fetch it directly
              try {
                const contactResponse = await axios.get(`/api/companies/${ticketCopy.companyID}/contacts`);
                if (Array.isArray(contactResponse.data)) {
                  const contactFromDB = contactResponse.data.find(c => c.id === ticketCopy.contactID);
                  if (contactFromDB) {
                    console.log(`Found contact in database: ${contactFromDB.firstName} ${contactFromDB.lastName}`);
                    // Add this contact to our contacts array if it's not already there
                    if (!fetchedContacts.some(c => c.id === contactFromDB.id)) {
                      const updatedContacts = [...fetchedContacts, contactFromDB];
                      setContacts(updatedContacts);
                    }
                  } else {
                    console.log(`Contact ID ${ticketCopy.contactID} not found in database, clearing contactID`);
                    ticketCopy.contactID = null;
                  }
                }
              } catch (error) {
                console.error('Error fetching contact directly:', error);
                ticketCopy.contactID = null;
              }
            }
          }
        } else {
          console.log('No company ID found in ticket data');
          setContacts([]);
        }

        // Make sure sub-issue types are filtered for the current issue type
        if (ticketCopy.issueType) {
          await fetchSubIssueTypes(ticketCopy.issueType, ticketCopy.subIssueType);
        }

      } catch (error) {
        console.error('Error fetching ticket details:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      } finally {
        setDialogLoading(false);
      }
    } else {
      // For new ticket, just set default values and open dialog
      setCurrentTicket({
        id: null,
        ticketNumber: `T${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        description: '',
        status: 1,
        priority: 1,
        assignedResourceID: null,
        companyID: null,
        contactID: null,
        ticketCategory: 1,
        ticketType: 1,
        issueType: 0,
        subIssueType: null,
        source: 8, // Default to Web Portal
        dueDateTime: null,
        contractID: null
      });

      // Clear contacts and comments for new ticket
      setContacts([]);
      setTicketComments([]);

      // Open the dialog immediately
      setOpenDialog(true);

      // Ensure dialogLoading is false for new tickets
      setDialogLoading(false);
    }
  };

  const handleCompanyChange = async (e) => {
    const companyId = e.target.value;
    console.log(`Company changed to ID: ${companyId}`);

    // Update the current ticket with the new company ID
    setCurrentTicket(prevTicket => {
      console.log(`Updating ticket with new companyID: ${companyId}`);
      return {
        ...prevTicket,
        companyID: companyId,
        contactID: null // Reset contact when company changes
      };
    });

    // Fetch contacts for the selected company
    // Pass the companyId directly to ensure we're using the new value
    console.log(`Fetching contacts for company ID: ${companyId}`);
    await fetchContacts(companyId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicket({
      ...currentTicket,
      [name]: value
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentTicket.id) return;

    try {
      // Format the comment based on type (internal or external)
      const commentData = {
        text: commentType === 'internal' ? `[INTERNAL] ${newComment}` : newComment,
        isInternal: commentType === 'internal'
      };

      // Post the comment to the API
      await axios.post(`/api/tickets/${currentTicket.id}/comments`, commentData);

      // Refresh comments
      await fetchTicketComments(currentTicket.id);

      // Clear the comment field
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    }
  };

  const handleSaveTicket = async () => {
    try {
      // Validate required fields
      if (!currentTicket.title || !currentTicket.companyID || !currentTicket.status || 
          !currentTicket.priority || !currentTicket.queueID || !currentTicket.issueType || 
          !currentTicket.subIssueType || !currentTicket.source || !currentTicket.dueDateTime || 
          !currentTicket.contractID || !currentTicket.ticketType) {
        alert('Please fill in all required fields: Company, Status, Priority, Queue, Issue Type, SubIssue Type, Source, Due Date, Contract, Ticket Type, and Ticket Title');
        return;
      }

      // Save the ticket to the API
      if (currentTicket.id) {
        // Update existing ticket
        const updateData = { ...currentTicket };
        if (newComment.trim()) {
          updateData.comment = {
            text: newComment,
            isInternal: commentType === 'internal'
          };
        }
        await axios.put(`/api/tickets/${currentTicket.id}`, updateData);
        if (newComment.trim()) {
          await fetchTicketComments(currentTicket.id);
          setNewComment('');
        }
      } else {
        // Add new ticket
        await axios.post('/api/tickets', currentTicket);
      }

      // Refresh the ticket list
      await fetchTickets();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('Error saving ticket. Please try again.');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        // Delete the ticket from the API
        await axios.delete(`/api/tickets/${id}`);

        // Refresh the ticket list
        await fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Error deleting ticket. Please try again.');
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
          Tickets
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            New Ticket
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTickets}
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
                placeholder="Search tickets..."
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
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={applyFilters}
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>

          {showFilters && (
            <>
              <Divider sx={{ my: 2 }} />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        label="Status"
                        multiple
                        renderValue={(selected) => {
                          console.log('Selected status values:', selected);
                          console.log('Available ticket statuses:', ticketStatuses);
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const status = ticketStatuses.find(s => s.id === value);
                                console.log(`Status ${value}:`, status);
                                return (
                                  <Chip 
                                    key={value} 
                                    label={status ? status.name : `Status ${value}`} 
                                    size="small" 
                                  />
                                );
                              })}
                            </Box>
                          );
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <ListSubheader>
                          <TextField
                            autoFocus
                            placeholder="Type to search..."
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                            onChange={handleStatusSearch}
                            onKeyDown={(e) => {
                              // Prevent the select from closing when typing
                              if (e.key !== 'Escape') {
                                e.stopPropagation();
                              }
                            }}
                          />
                        </ListSubheader>
                        {ticketStatuses
                          .filter(status => 
                            status.name.toLowerCase().includes(statusSearchTerm.toLowerCase())
                          )
                          .map(status => (
                            <MenuItem key={status.id} value={status.id}>
                              {status.name}
                            </MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={filters.priority}
                        onChange={handleFilterChange}
                        label="Priority"
                      >
                        <MenuItem value="">All Priorities</MenuItem>
                        <MenuItem value={4}>Critical</MenuItem>
                        <MenuItem value={1}>High</MenuItem>
                        <MenuItem value={2}>Medium</MenuItem>
                        <MenuItem value={3}>Low</MenuItem>
                        <MenuItem value={5}>Very Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Company</InputLabel>
                      <Select
                        name="companyID"
                        value={filters.companyID}
                        onChange={handleFilterChange}
                        label="Company"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <ListSubheader>
                          <TextField
                            autoFocus
                            placeholder="Type to search..."
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                            onChange={handleCompanySearch}
                            onKeyDown={(e) => {
                              // Prevent the select from closing when typing
                              if (e.key !== 'Escape') {
                                e.stopPropagation();
                              }
                            }}
                          />
                        </ListSubheader>
                        <MenuItem value="">All Companies</MenuItem>
                        {companies
                          .filter(company => 
                            company.CompanyName && company.CompanyName.toLowerCase().includes(companySearchTerm.toLowerCase())
                          )
                          .map(company => (
                            <MenuItem key={company.id} value={company.id}>
                              {company.CompanyName}
                            </MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Queue</InputLabel>
                      <Select
                        name="queueID"
                        value={filters.queueID}
                        onChange={handleFilterChange}
                        label="Queue"
                      >
                        <MenuItem value="">All Queues</MenuItem>
                        {queues.map(queue => (
                          <MenuItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Assigned To</InputLabel>
                      <Select
                        name="assignedResourceID"
                        value={filters.assignedResourceID}
                        onChange={handleFilterChange}
                        label="Assigned To"
                      >
                        <MenuItem value="">All Resources</MenuItem>
                        {resources.map(resource => (
                          <MenuItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Ticket Number"
                      name="ticketNumber"
                      value={filters.ticketNumber}
                      onChange={handleFilterChange}
                      placeholder="Enter exact ticket number"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DatePicker
                      label="Created After"
                      value={filters.createdAfter}
                      onChange={(date) => handleDateFilterChange('createdAfter', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DatePicker
                      label="Created Before"
                      value={filters.createdBefore}
                      onChange={(date) => handleDateFilterChange('createdBefore', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
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
              </LocalizationProvider>
            </>
          )}
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.ticketNumber}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{getStatusChip(ticket.status, ticket.status_name)}</TableCell>
                  <TableCell>{getPriorityChip(ticket.priority, ticket.priority_name)}</TableCell>
                  <TableCell>{ticket.company_name || 'N/A'}</TableCell>
                  <TableCell>{ticket.assigned_resource_name}</TableCell>
                  <TableCell>{ticket.createDate ? formatDate(ticket.createDate, 'MMM d, yyyy') : 'N/A'}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(ticket)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteTicket(ticket.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No tickets found
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
            Showing {tickets.length} of {totalItems} tickets
          </Typography>
        </Stack>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
        <DialogTitle>{currentTicket.id ? 'Edit Ticket' : 'New Ticket'}</DialogTitle>
        <DialogContent>
          {dialogLoading && currentTicket.id && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 10
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Loading ticket details...
                </Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ mt: 2, position: 'relative' }}>
            {/* Three-column layout for ticket fields */}
            <Grid container spacing={2}>
              {/* Left Column - Company, Contact, Status, Priority, Queue, Issue Type, SubIssueType, Source, Primary Resource */}
              <Grid item xs={12} md={3}>
                <Typography variant="h6" gutterBottom>Company & Ticket Details</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="companyID"
                    value={currentTicket.companyID || ''}
                    onChange={handleCompanyChange}
                    label="Company"
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        autoFocus
                        placeholder="Type to search..."
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleEditCompanySearch}
                        onKeyDown={(e) => {
                          // Prevent the select from closing when typing
                          if (e.key !== 'Escape') {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </ListSubheader>
                    {companies
                      .filter(company => 
                        company.CompanyName && company.CompanyName.toLowerCase().includes(editCompanySearchTerm.toLowerCase())
                      )
                      .map(company => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.CompanyName}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Contact</InputLabel>
                  <Select
                    name="contactID"
                    value={currentTicket.contactID || ''}
                    onChange={handleInputChange}
                    label="Contact"
                    disabled={!currentTicket.companyID}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        autoFocus
                        placeholder="Type to search..."
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleContactSearch}
                        onKeyDown={(e) => {
                          // Prevent the select from closing when typing
                          if (e.key !== 'Escape') {
                            e.stopPropagation();
                          }
                        }}
                        disabled={!currentTicket.companyID}
                      />
                    </ListSubheader>
                    {contacts
                      .filter(contact => 
                        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(contactSearchTerm.toLowerCase())
                      )
                      .map(contact => (
                        <MenuItem key={contact.id} value={contact.id}>
                          {`${contact.firstName} ${contact.lastName}`}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={currentTicket.status}
                    onChange={handleInputChange}
                    label="Status"
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        autoFocus
                        placeholder="Type to search..."
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleEditStatusSearch}
                        onKeyDown={(e) => {
                          // Prevent the select from closing when typing
                          if (e.key !== 'Escape') {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </ListSubheader>
                    {ticketStatuses
                      .filter(status => 
                        status.name.toLowerCase().includes(editStatusSearchTerm.toLowerCase())
                      )
                      .map(status => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={currentTicket.priority}
                    onChange={handleInputChange}
                    label="Priority"
                    required
                  >
                    <MenuItem value={4}>Critical</MenuItem>
                    <MenuItem value={1}>High</MenuItem>
                    <MenuItem value={2}>Medium</MenuItem>
                    <MenuItem value={3}>Low</MenuItem>
                    <MenuItem value={5}>Very Low</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Queue</InputLabel>
                  <Select
                    name="queueID"
                    value={currentTicket.queueID || ''}
                    onChange={handleInputChange}
                    label="Queue"
                    required
                  >
                    <MenuItem value="">None</MenuItem>
                    {queues.map(queue => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    name="issueType"
                    value={currentTicket.issueType || 0}
                    onChange={(e) => {
                      handleInputChange(e);
                      // When issue type changes, fetch sub-issue types for this issue type
                      if (e.target.value) {
                        fetchSubIssueTypes(e.target.value);
                      } else {
                        // If no issue type selected, clear sub-issue types
                        setSubIssueTypes([]);
                      }
                    }}
                    label="Issue Type"
                    required
                  >
                    {issueTypes.map(issueType => (
                      <MenuItem key={issueType.id} value={issueType.id}>
                        {issueType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Sub-Issue Type</InputLabel>
                  <Select
                    name="subIssueType"
                    value={currentTicket.subIssueType || ''}
                    onChange={handleInputChange}
                    label="Sub-Issue Type"
                    disabled={!currentTicket.issueType}
                    required
                  >
                    <MenuItem value="">None</MenuItem>
                    {subIssueTypes.map(subIssueType => (
                      <MenuItem key={subIssueType.id} value={subIssueType.id}>
                        {subIssueType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Source</InputLabel>
                  <Select
                    name="source"
                    value={currentTicket.source}
                    onChange={handleInputChange}
                    label="Source"
                    required
                  >
                    {sources.map(source => (
                      <MenuItem key={source.id} value={source.id}>
                        {source.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Contract</InputLabel>
                  <Select
                    name="contractID"
                    value={currentTicket.contractID || ''}
                    onChange={handleInputChange}
                    label="Contract"
                    required
                  >
                    <MenuItem value="">Select a Contract</MenuItem>
                    {contracts.map(contract => (
                      <MenuItem key={contract.id} value={contract.id}>
                        {contract.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Primary Resource</InputLabel>
                  <Select
                    name="assignedResourceID"
                    value={currentTicket.assignedResourceID || ''}
                    onChange={handleInputChange}
                    label="Primary Resource"
                  >
                    {resources.map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Middle Column - Ticket Category, Ticket Type, Title, Description, Comments */}
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>Ticket Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Ticket Number
                  </Typography>
                  <Typography variant="h6">
                    {currentTicket.ticketNumber}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Ticket Category</InputLabel>
                      <Select
                        name="ticketCategory"
                        value={currentTicket.ticketCategory}
                        onChange={handleInputChange}
                        label="Ticket Category"
                        required
                      >
                        {ticketCategories.map(category => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Ticket Type</InputLabel>
                      <Select
                        name="ticketType"
                        value={currentTicket.ticketType}
                        onChange={handleInputChange}
                        label="Ticket Type"
                        required
                      >
                        {ticketTypes.map(type => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={currentTicket.title}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={currentTicket.description}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={6}
                />

                {currentTicket.id && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Comments</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Comment Type</InputLabel>
                        <Select
                          value={commentType}
                          onChange={(e) => setCommentType(e.target.value)}
                          label="Comment Type"
                        >
                          <MenuItem value="internal">Internal Note</MenuItem>
                          <MenuItem value="external">External Comment</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Add Comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        multiline
                        rows={5}
                      />
                      <Button 
                        variant="contained" 
                        color="primary"
                        disabled={!newComment.trim()}
                        onClick={handleAddComment}
                        sx={{ alignSelf: 'flex-end' }}
                      >
                        Add Comment
                      </Button>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Comment History</Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', p: 2, mb: 2 }}>
                      {ticketComments.length > 0 ? (
                        ticketComments.map((comment) => (
                          <Box key={comment.id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{comment.user_name} - {formatDate(comment.created_at, 'MMM d, yyyy h:mm a')}</span>
                              {comment.is_internal ? (
                                <Chip size="small" label="Internal" color="secondary" />
                              ) : (
                                <Chip size="small" label="External" color="primary" />
                              )}
                            </Typography>
                            <Typography variant="body2">{comment.comment_text}</Typography>
                            <Divider sx={{ mt: 1 }} />
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2">No comments yet</Typography>
                      )}
                    </Paper>
                  </>
                )}
              </Grid>

              {/* Right Column - Additional Information */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {companies.find(c => c.id === currentTicket.companyID)?.CompanyName || 'No company selected'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body1">
                    {contacts.find(c => c.id === currentTicket.contactID) 
                      ? `${contacts.find(c => c.id === currentTicket.contactID).firstName} ${contacts.find(c => c.id === currentTicket.contactID).lastName}`
                      : 'No contact selected'}
                  </Typography>
                </Box>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={currentTicket.dueDateTime}
                    onChange={(date) => setCurrentTicket({...currentTicket, dueDateTime: date})}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    required
                  />
                </LocalizationProvider>
                {currentTicket.id && (
                  <SlaTracker ticketId={currentTicket.id} />
                )}

              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTicket} 
            variant="contained" 
            color="primary"
            disabled={!currentTicket.title || !currentTicket.companyID || !currentTicket.status || 
                     !currentTicket.priority || !currentTicket.queueID || !currentTicket.issueType || 
                     !currentTicket.subIssueType || !currentTicket.source || !currentTicket.dueDateTime || 
                     !currentTicket.contractID || !currentTicket.ticketType}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
