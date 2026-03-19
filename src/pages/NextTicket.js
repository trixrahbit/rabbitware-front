import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Chip,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Send as SendIcon,
  Assignment as TicketIcon,
  Person as ContactIcon,
  Business as CompanyIcon,
  AccessTime as TimeIcon,
  PriorityHigh as PriorityIcon,
  CheckCircle as ResolvedIcon,
  Error as OpenIcon,
  Warning as PendingIcon,
  SkipNext as SkipIcon,
  Score as ScoreIcon,
  List as ListIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import { formatDistance } from 'date-fns';
import useTimezone, { useSettingsTimezone } from '../hooks/useTimezone';

export default function NextTicket() {
  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State management
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [scoredTickets, setScoredTickets] = useState([]);
  const [showScoredTickets, setShowScoredTickets] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [skippingTicket, setSkippingTicket] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [accessError, setAccessError] = useState('');

  // New state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('weight');
  const [sortDirection, setSortDirection] = useState('desc');
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const { formatDate } = useSettingsTimezone();

  // Memoized function to sort and filter tickets
  const processedTickets = useMemo(() => {
    if (!scoredTickets.length) return [];

    // Filter tickets based on search term
    let filtered = scoredTickets;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = scoredTickets.filter(ticket => 
        (ticket.title && ticket.title.toLowerCase().includes(search)) ||
        (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(search)) ||
        (ticket.company_name && ticket.company_name.toLowerCase().includes(search)) ||
        (ticket.assigned_resource_name && ticket.assigned_resource_name.toLowerCase().includes(search))
      );
    }

    // Sort tickets based on sort field and direction
    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle undefined or null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Sort based on direction
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });
  }, [scoredTickets, searchTerm, sortField, sortDirection]);

  // Handle sort change
  const handleSortChange = useCallback((field) => {
    setSortField(field);
    setSortDirection(prevDirection => 
      field === sortField 
        ? (prevDirection === 'asc' ? 'desc' : 'asc')
        : 'desc'
    );
  }, [sortField]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setTicketsLoading(true);
        setError(null);

        // Fetch scored tickets first
        const tickets = await fetchScoredTickets();

        if (tickets && tickets.length > 0) {
          // If we have tickets, select the first (highest scored) one
          await selectTicket(tickets[0].id, tickets[0].weight);
        } else {
          // If no scored tickets, fall back to fetchNextTicket
          await fetchNextTicket();
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load ticket data. Please try again.');
      } finally {
        setLoading(false);
        setTicketsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Optimized data fetching functions with better error handling
  const fetchNextTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/next-ticket');
      setTicket(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching next ticket:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setError('Failed to load the next ticket. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTicket = useCallback(async (ticketId, weight) => {
    try {
      setLoading(true);
      setError(null);

      // Find the ticket in the scored tickets list to get the correct weight
      const scoredTicket = scoredTickets.find(t => t.id === ticketId);
      const correctWeight = scoredTicket ? scoredTicket.weight : weight;

      const response = await axios.get(`/api/tickets/${ticketId}`);
      const detailed = response.data;

      // Always use the weight from the scored tickets list
      detailed.weight = correctWeight;

      setTicket(detailed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return detailed;
    } catch (error) {
      console.error('Error loading ticket:', error);
      setError('Failed to load the selected ticket.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [scoredTickets]);

  const fetchScoredTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      const response = await axios.get('/api/scored-tickets');

      // Sort tickets by weight (score) in descending order
      const sortedTickets = [...response.data].sort((a, b) => b.weight - a.weight);
      setScoredTickets(sortedTickets);
      return sortedTickets;
    } catch (error) {
      console.error('Error fetching scored tickets:', error);
      // Don't set error state here to avoid disrupting the main ticket view
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      return [];
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const skipTicket = async () => {
  try {
    setSkippingTicket(true);

    const response = await axios.post('/api/skip-ticket', {
      current_ticket_id: ticket.id,
    });

    setTicket(response.data);
    await fetchScoredTickets();
  } catch (error) {
    console.error('Error skipping ticket:', error);
  } finally {
    setSkippingTicket(false);
  }
};


  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const openStatusDialog = () => {
    // Initialize with current status
    setNewStatus(ticket.status.toString());
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const updateTicketStatus = async () => {
    if (!newStatus) return;

    try {
      setUpdatingStatus(true);

      // Update the ticket status
      await axios.put(`/api/tickets/${ticket.id}`, {
        status: parseInt(newStatus)
      });

      // Refresh the ticket and scored tickets
      await fetchNextTicket();
      await fetchScoredTickets();

      setUpdatingStatus(false);
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setUpdatingStatus(false);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);

      // In a real application, you would submit the comment to your API
      await axios.post(`/api/tickets/${ticket.id}/comments`, { text: comment });

      // Refresh the ticket to show the new comment
      await fetchNextTicket();

      // Clear the comment field
      setComment('');
      setSubmittingComment(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmittingComment(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status, statusName) => {
    // Common chip styling for text overflow
    const chipStyle = {
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    };

    // Map status to appropriate chip
    if (statusName) {
      if (statusName.toLowerCase().includes('complete') || statusName.toLowerCase().includes('resolved')) {
        return <Chip icon={<ResolvedIcon />} label={statusName} color="success" sx={chipStyle} />;
      } else if (statusName.toLowerCase().includes('progress') || statusName.toLowerCase().includes('waiting')) {
        return <Chip icon={<PendingIcon />} label={statusName} color="warning" sx={chipStyle} />;
      } else {
        return <Chip icon={<OpenIcon />} label={statusName} color="error" sx={chipStyle} />;
      }
    }

    // Fallback to status ID if name not available
    switch (status) {
      case 1: // New
      case 11: // Escalated
        return <Chip icon={<OpenIcon />} label="Open" color="error" sx={chipStyle} />;
      case 2: // In Progress
      case 7: // Waiting Client
      case 24: // Client Responded
      case 41: // Waiting Vendor
        return <Chip icon={<PendingIcon />} label="In Progress" color="warning" sx={chipStyle} />;
      case 5: // Completed
        return <Chip icon={<ResolvedIcon />} label="Resolved" color="success" sx={chipStyle} />;
      default:
        return <Chip label={`Status ${status}`} sx={chipStyle} />;
    }
  };

  const getPriorityChip = (priority, priorityName) => {
    // Common chip styling for text overflow
    const chipStyle = {
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    };

    // Use priority name if available
    if (priorityName) {
      if (priorityName.toLowerCase().includes('critical')) {
        return <Chip label={priorityName} color="error" sx={chipStyle} />;
      } else if (priorityName.toLowerCase().includes('high')) {
        return <Chip label={priorityName} color="error" sx={chipStyle} />;
      } else if (priorityName.toLowerCase().includes('medium')) {
        return <Chip label={priorityName} color="warning" sx={chipStyle} />;
      } else if (priorityName.toLowerCase().includes('low')) {
        return <Chip label={priorityName} color="info" sx={chipStyle} />;
      } else {
        return <Chip label={priorityName} sx={chipStyle} />;
      }
    }

    // Fallback to priority ID if name not available
    switch (priority) {
      case 4: // Critical
        return <Chip label="Critical" color="error" sx={chipStyle} />;
      case 1: // High
        return <Chip label="High" color="error" sx={chipStyle} />;
      case 2: // Medium
        return <Chip label="Medium" color="warning" sx={chipStyle} />;
      case 3: // Low
      case 5: // Very Low
        return <Chip label="Low" color="info" sx={chipStyle} />;
      default:
        return <Chip label={`Priority ${priority}`} sx={chipStyle} />;
    }
  };

  const formatTicketDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDate(dateString, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Ticket details loading skeleton
  const TicketDetailsSkeleton = () => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="rounded" width={100} height={32} sx={{ ml: 2 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
        </Box>
      </Box>
      <Skeleton variant="text" width="80%" height={40} sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width={120} height={32} sx={{ mb: 2 }} />

          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={24} sx={{ mb: 2 }} />

          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />

          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />

          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="95%" height={20} />
        </Grid>
      </Grid>
    </Paper>
  );

  // Comments loading skeleton
  const CommentsSkeleton = () => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={100} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Skeleton variant="rounded" width={100} height={36} />
      </Box>
      <Divider sx={{ my: 2 }} />

      {[1, 2].map((i) => (
        <Box key={i} sx={{ display: 'flex', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={100} height={20} />
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </Box>
        </Box>
      ))}
    </Paper>
  );

  // Render ticket details with improved layout and responsiveness
  const renderTicketDetails = () => {
    if (loading) {
      return (
        <>
          <TicketDetailsSkeleton />
          <CommentsSkeleton />
        </>
      );
    }

    return (
      <>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3, 
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between',
                mb: 2 
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: { xs: 2, sm: 0 },
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TicketIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                      {ticket.ticketNumber}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<ScoreIcon />}
                    label={`Score: ${ticket.weight || 0}`}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      ml: { xs: 0, sm: 2 },
                      '& .MuiChip-label': { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        padding: '0 8px',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  {getStatusChip(ticket.status, ticket.status_name)}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={openStatusDialog}
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 'medium'
                    }}
                  >
                    Change Status
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SkipIcon />}
                    onClick={skipTicket}
                    disabled={skippingTicket}
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 'medium'
                    }}
                  >
                    {skippingTicket ? 'Skipping...' : 'Skip Ticket'}
                  </Button>
                </Box>
              </Box>

              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'medium',
                  color: 'text.primary',
                  mb: 3,
                  lineHeight: 1.3
                }}
              >
                {ticket.title}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Ticket Information
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Priority
                    </Typography>
                    {getPriorityChip(ticket.priority, ticket.priority_name)}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Company
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CompanyIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                      <Typography sx={{ fontWeight: 'medium' }}>
                        {ticket.company_name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contact
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContactIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                      <Typography>{ticket.contact_name || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Assignment & Timing
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned To
                    </Typography>
                    <Typography sx={{ fontWeight: 'medium' }}>
                      {ticket.assigned_resource_name || 'Unassigned'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Created
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                      <Typography>
                        {formatTicketDate(ticket.createDate)}
                        {ticket.createDate && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({formatDistance(new Date(ticket.createDate), new Date(), { addSuffix: true })})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Due Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                      <Typography>
                        {formatTicketDate(ticket.dueDateTime)}
                        {ticket.dueDateTime && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({formatDistance(new Date(ticket.dueDateTime), new Date(), { addSuffix: true })})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Description
                  </Typography>
                  <Typography 
                    paragraph 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50],
                      p: 2,
                      borderRadius: 1,
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}
                  >
                    {ticket.description || 'No description provided.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3, 
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Comments
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Add a comment"
              multiline
              rows={3}
              value={comment}
              onChange={handleCommentChange}
              disabled={submittingComment}
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSubmitComment}
                disabled={!comment.trim() || submittingComment}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 'medium'
                }}
              >
                {submittingComment ? 'Sending...' : 'Send Comment'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {ticket?.comments?.length > 0 ? (
            <List sx={{ p: 0 }}>
              {ticket.comments.map((comment) => (
                <ListItem 
                  key={comment.id} 
                  alignItems="flex-start" 
                  sx={{ 
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {comment.user_name?.charAt(0) ?? '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {comment.user_name || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTicketDate(comment.created_at)}
                          {comment.created_at && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ({formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        sx={{ 
                          display: 'inline', 
                          whiteSpace: 'pre-wrap',
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50],
                          p: 1.5,
                          borderRadius: 1,
                          display: 'block',
                          mt: 1
                        }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {comment.comment_text}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No comments yet.</Typography>
              <Typography variant="caption" color="text.secondary">
                Be the first to add a comment to this ticket.
              </Typography>
            </Box>
          )}
        </Paper>
      </>
    );
  };


  // Ticket list loading skeleton
  const TicketListSkeleton = () => (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={150} height={32} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={120} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
      </Box>

      <Skeleton variant="rounded" width="100%" height={50} sx={{ mb: 2 }} />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {[15, 30, 25, 15, 15].map((width, i) => (
                <TableCell key={i} width={`${width}%`}>
                  <Skeleton variant="text" width="80%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                {[1, 2, 3, 4, 5].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton variant="text" width="90%" height={cell === 2 ? 40 : 24} />
                    {cell === 3 && <Skeleton variant="text" width="70%" height={24} sx={{ mt: 1 }} />}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Skeleton variant="rounded" width="100%" height={40} />
      </Box>
    </Paper>
  );

  // Error display component
  const ErrorDisplay = ({ message, onRetry }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        borderRadius: 2,
        maxWidth: 600,
        mx: 'auto',
        mt: 4
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        {message}
      </Typography>
      <Typography color="text.secondary" paragraph>
        There was a problem loading the ticket data. Please try again.
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<RefreshIcon />} 
        onClick={onRetry}
        sx={{ 
          mt: 2,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 'medium'
        }}
      >
        Try Again
      </Button>
    </Paper>
  );

  // Empty state component
  const EmptyState = ({ message, description, onRefresh }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        borderRadius: 2,
        maxWidth: 600,
        mx: 'auto',
        mt: 4
      }}
    >
      <Typography variant="h5" gutterBottom>
        {message}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {description}
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<RefreshIcon />} 
        onClick={onRefresh}
        sx={{ 
          mt: 2,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 'medium'
        }}
      >
        Refresh
      </Button>
    </Paper>
  );

  // Ticket list component with sorting and filtering
  const TicketList = () => {
    // If tickets are loading, show skeleton
    if (ticketsLoading) {
      return <TicketListSkeleton />;
    }

    // Get the tickets to display based on pagination
    const displayedTickets = rowsPerPage > 0
      ? processedTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : processedTickets;

    // Sort indicator component
    const SortIndicator = ({ field }) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' 
        ? <ArrowUpIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
        : <ArrowDownIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />;
    };

    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Tickets by Score
            <Badge 
              badgeContent={processedTickets.length} 
              color="primary" 
              sx={{ ml: 2 }}
            />
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchScoredTickets}
              disabled={ticketsLoading}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none'
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: { borderRadius: 2 }
            }}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {displayedTickets.length > 0 ? (
            displayedTickets.map((t) => (
              <Card
                key={t.id}
                elevation={t.id === ticket?.id ? 3 : 1}
                sx={{ 
                  cursor: 'pointer',
                  backgroundColor: t.id === ticket?.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  transition: 'all 0.2s',
                  borderRadius: 2,
                  border: t.id === ticket?.id ? '1px solid' : '1px solid',
                  borderColor: t.id === ticket?.id ? 'primary.main' : 'divider',
                  boxShadow: t.id === ticket?.id ? 3 : 1
                }}
                onClick={() => selectTicket(t.id, t.weight)}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                  {/* First row - Ticket # and Score */}
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    {/* Ticket Number */}
                    <Grid item xs={7} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: '60px', fontWeight: 'medium' }}>
                          Ticket #:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: t.id === ticket?.id ? 'bold' : 'medium',
                            color: t.id === ticket?.id ? 'primary.main' : 'text.primary'
                          }}
                        >
                          {t.ticketNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Score */}
                    <Grid item xs={5} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 'medium' }}>
                          Score:
                        </Typography>
                        <Chip
                          icon={<ScoreIcon />}
                          label={t.weight}
                          color={t.id === ticket?.id ? 'primary' : 'default'}
                          variant={t.id === ticket?.id ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            minWidth: '70px'
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Title row */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1, mt: 0.3, minWidth: '40px', fontWeight: 'medium' }}>
                        Title:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: t.id === ticket?.id ? 'bold' : 'medium',
                          color: t.id === ticket?.id ? 'primary.main' : 'text.primary',
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {t.title}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status and Priority row */}
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    {/* Status */}
                    <Grid item xs={6} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: '60px', fontWeight: 'medium' }}>
                          Status:
                        </Typography>
                        {getStatusChip(t.status, t.status_name)}
                      </Box>
                    </Grid>

                    {/* Priority */}
                    <Grid item xs={6} sm={6} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: '60px', fontWeight: 'medium' }}>
                          Priority:
                        </Typography>
                        {getPriorityChip(t.priority, t.priority_name)}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Company row */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: '70px', fontWeight: 'medium' }}>
                        Company:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: 'text.primary',
                          wordBreak: 'break-word'
                        }}
                      >
                        {t.company_name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">No tickets match your search criteria</Typography>
            </Paper>
          )}
        </Box>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={processedTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem'
            }
          }}
        />
      </Paper>
    );
  };

  // Main render logic
  if (accessError) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay 
          message={accessError} 
          onRetry={fetchNextTicket} 
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay 
          message={error} 
          onRetry={fetchNextTicket} 
        />
      </Box>
    );
  }

  // Show loading indicator when data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Calculating next ticket...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Only show "No tickets available" when we're sure there are no tickets
  if (!ticket || ticket.message === "No tickets available") {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState 
          message="No tickets available" 
          description="There are no tickets assigned to you or all tickets have been resolved."
          onRefresh={fetchNextTicket}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: { xs: 1, sm: 0 }
          }}
        >
          Next Ticket
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={showScoredTickets ? "contained" : "outlined"}
            startIcon={<ListIcon />}
            onClick={() => setShowScoredTickets(!showScoredTickets)}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            {showScoredTickets ? 'Hide Ticket List' : 'Show Ticket List'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNextTicket}
            disabled={loading}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {showScoredTickets ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TicketList />
          </Grid>

          <Grid item xs={12} lg={6}>
            {renderTicketDetails()}
          </Grid>
        </Grid>
      ) : (
        renderTicketDetails()
      )}
  {/* Status Change Dialog */}
  <Dialog 
    open={statusDialogOpen} 
    onClose={closeStatusDialog}
    PaperProps={{
      sx: {
        borderRadius: 2,
        maxWidth: 500
      }
    }}
  >
    <DialogTitle sx={{ 
      fontWeight: 'bold', 
      bgcolor: 'primary.main', 
      color: 'white',
      px: 3,
      py: 2
    }}>
      Change Ticket Status
    </DialogTitle>

    <DialogContent sx={{ p: 3, mt: 1 }}>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select a new status for ticket <strong>{ticket?.ticketNumber}</strong>
      </Typography>

      <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
        <InputLabel>Status</InputLabel>
        <Select 
          value={newStatus} 
          onChange={handleStatusChange} 
          label="Status"
          sx={{ 
            borderRadius: 1.5,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
          renderValue={(value) => {
            const statusName = {
              "1": "New",
              "2": "In Progress",
              "5": "Completed",
              "7": "Waiting Client",
              "11": "Escalated",
              "21": "Working Issue Now",
              "24": "Client Responded",
              "28": "Quote Needed",
              "29": "Reopened",
              "32": "Scheduled",
              "36": "Scheduling Needed",
              "41": "Waiting Vendor",
              "54": "Needs Project",
              "56": "Received in Full",
              "64": "Scheduled Next NA",
              "70": "Assigned",
              "71": "Schedule Onsite",
              "74": "Scheduled Onsite",
              "38": "Waiting on Hold"
            }[value] || `Status ${value}`;

            return (
              <>
                {getStatusChip(parseInt(value), statusName)}
                <Typography sx={{ ml: 1 }}>{statusName}</Typography>
              </>
            );
          }}
        >
          <MenuItem value="1">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(1, "New")}
              <Typography>New</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="2">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(2, "In Progress")}
              <Typography>In Progress</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="5">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(5, "Completed")}
              <Typography>Completed</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="7">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(7, "Waiting Client")}
              <Typography>Waiting Client</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="11">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(11, "Escalated")}
              <Typography>Escalated</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="21">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(21, "Working Issue Now")}
              <Typography>Working Issue Now</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="24">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(24, "Client Responded")}
              <Typography>Client Responded</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="28">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(28, "Quote Needed")}
              <Typography>Quote Needed</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="29">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(29, "Reopened")}
              <Typography>Reopened</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="32">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(32, "Scheduled")}
              <Typography>Scheduled</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="36">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(36, "Scheduling Needed")}
              <Typography>Scheduling Needed</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="41">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(41, "Waiting Vendor")}
              <Typography>Waiting Vendor</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="54">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(54, "Needs Project")}
              <Typography>Needs Project</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="56">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(56, "Received in Full")}
              <Typography>Received in Full</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="64">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(64, "Scheduled Next NA")}
              <Typography>Scheduled Next NA</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="70">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(70, "Assigned")}
              <Typography>Assigned</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="71">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(71, "Schedule Onsite")}
              <Typography>Schedule Onsite</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="74">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(74, "Scheduled Onsite")}
              <Typography>Scheduled Onsite</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="38">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusChip(38, "Waiting on Hold")}
              <Typography>Waiting on Hold</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button 
        onClick={closeStatusDialog}
        sx={{ 
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 'medium'
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={updateTicketStatus}
        variant="contained"
        color="primary"
        disabled={updatingStatus}
        sx={{ 
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 'medium'
        }}
      >
        {updatingStatus ? 'Updating...' : 'Update Status'}
      </Button>
    </DialogActions>
  </Dialog>
</Box>
  );
}
