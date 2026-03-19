import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  Description as ContractIcon,
  People as UserIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tickets: {
      total: 0,
      open: 0,
      resolved: 0
    },
    contracts: {
      total: 0,
      active: 0,
      expiring: 0
    },
    users: {
      total: 0,
      active: 0,
      admins: 0
    },
    systemStatus: {
      services: [
        { name: 'API Server', status: 'operational' },
        { name: 'Database', status: 'operational' },
        { name: 'Authentication', status: 'operational' },
        { name: 'Ticket Sync', status: 'operational' }
      ]
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch real data from the API
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
        // Set fallback data in case of error
        setStats({
          tickets: {
            total: 0,
            open: 0,
            resolved: 0
          },
          contracts: {
            total: 0,
            active: 0,
            expiring: 0
          },
          users: {
            total: 0,
            active: 0,
            admins: 0
          },
          systemStatus: {
            services: [
              { name: 'API Server', status: 'error', message: 'Failed to fetch data' },
              { name: 'Database', status: 'error', message: 'Failed to fetch data' },
              { name: 'Authentication', status: 'error', message: 'Failed to fetch data' },
              { name: 'Ticket Sync', status: 'error', message: 'Failed to fetch data' }
            ]
          }
        });
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <SuccessIcon color="success" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'operational':
        return <Chip label="Operational" color="success" size="small" />;
      case 'warning':
        return <Chip label="Warning" color="warning" size="small" />;
      case 'error':
        return <Chip label="Error" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the RabbitAI Admin Dashboard. Here's an overview of your system.
      </Typography>

      <Grid container spacing={3}>
        {/* Tickets Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Tickets" 
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<TicketIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" align="center" gutterBottom>
                {stats.tickets.total}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Open
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.tickets.open}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Resolved
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.tickets.resolved}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contracts Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Contracts" 
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<ContractIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" align="center" gutterBottom>
                {stats.contracts.total}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Active
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.contracts.active}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Expiring Soon
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.contracts.expiring}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Users Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Users" 
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<UserIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" align="center" gutterBottom>
                {stats.users.total}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Active
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.users.active}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Admins
                  </Typography>
                  <Typography variant="h6" align="center">
                    {stats.users.admins}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="System Status" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <List>
                {stats.systemStatus.services.map((service, index) => (
                  <ListItem key={index} divider={index < stats.systemStatus.services.length - 1}>
                    <ListItemIcon>
                      {getStatusIcon(service.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={service.name} 
                      secondary={service.message} 
                    />
                    <Box>
                      {getStatusChip(service.status)}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
