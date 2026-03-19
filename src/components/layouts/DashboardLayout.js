import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ConfirmationNumber as TicketsIcon,
  Description as ContractsIcon,
  People as UsersIcon,
  Logout as LogoutIcon,
  AccountCircle,
  AssignmentTurnedIn as NextTicketIcon,
  Security as SecurityIcon,
  Link as IntegrationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as CompanyIcon,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
  Notifications as AlertingIcon,
  BarChart as BarChartIcon,
  Storage as StorageIcon,
  Subscriptions as SubscriptionsIcon,
  Chat as ChatIcon,
  AutoFixHigh as OrchestrationIcon,
  Computer as DevicesIcon,
  Healing as HealingIcon,
  MonitorHeart as MonitoringIcon,
  Send as AutoDispatchIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTenant } from '../../contexts/TenantContext';
import FloatingChat from '../FloatingChat';

const drawerWidth = 240;

const menuItems = [
  { 
    text: 'Home', 
    icon: <DashboardIcon />, 
    path: '/dashboard'
  },
  { text: 'Companies', icon: <CompanyIcon />, path: '/dashboard/companies' },
  { 
    text: 'Apps', 
    icon: <DashboardIcon />, 
    path: '/dashboard/next-ticket',
    subItems: [
      { text: 'Next Ticket', icon: <NextTicketIcon />, path: '/dashboard/next-ticket' },
      { text: 'Tickets', icon: <TicketsIcon />, path: '/dashboard/tickets' },
      { text: 'Calendars', icon: <CalendarMonthIcon />, path: '/dashboard/calendars' },

    ]
  },
  { text: 'Devices', icon: <DevicesIcon />, path: '/dashboard/devices' },
  {
    text: 'Self Healing',
    icon: <HealingIcon />,
    path: '/dashboard/self-healing',
    subItems: [
      { text: 'Jobs', path: '/dashboard/self-healing' },
      { text: 'Profiles', path: '/dashboard/self-healing/profiles' }
    ]
  },
  { text: 'Monitoring', icon: <MonitoringIcon />, path: '/dashboard/monitoring' },
  { text: 'Alerting', icon: <AlertingIcon />, path: '/dashboard/alerting' },
  {
    text: 'Orchestration',
    icon: <OrchestrationIcon />,
    path: '/dashboard/orchestration',
    subItems: [
      { text: 'Orchestrations', path: '/dashboard/orchestration' },
      { text: 'Scripts', path: '/dashboard/orchestration?tab=scripts' },
      { text: 'Webhooks', path: '/dashboard/orchestration?tab=webhooks' },
      { text: 'Triggers', path: '/dashboard/orchestration?tab=triggers' }
    ]
  },
  {
    text: 'Auto Dispatch',
    icon: <AutoDispatchIcon />,
    path: '/dashboard/auto-dispatch',
    subItems: [
      { text: 'Overview', path: '/dashboard/auto-dispatch' },
      { text: 'Skills', path: '/dashboard/auto-dispatch/skills' },
      { text: 'User Skills', path: '/dashboard/auto-dispatch/user-skills' },
      { text: 'Rules', path: '/dashboard/auto-dispatch/rules' },
      { text: 'Business Hours', path: '/dashboard/auto-dispatch/business-hours' }
    ]
  },
  {
    text: 'analytics',
    icon: <BarChartIcon />,
    path: '/dashboard/analytics',
    subItems: [
      { text: 'Dashboards', path: '/dashboard/analytics' },
      { text: 'Gauges', path: '/dashboard/analytics/gauges' }
    ]
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/dashboard/settings',
    subItems: [
      { text: 'General Settings', path: '/dashboard/settings' },
      { text: 'Next Ticket Settings', path: '/dashboard/next-ticket-settings' },
      { text: 'Users', icon: <UsersIcon />, path: '/dashboard/users' },
      { text: 'Roles', icon: <SecurityIcon />, path: '/dashboard/roles' },
      { text: 'Tenants', icon: <CompanyIcon />, path: '/dashboard/tenants' },
      { text: 'Integrations', icon: <IntegrationsIcon />, path: '/dashboard/integrations' },
      { text: 'Company Mapping', path: '/dashboard/company-mapping' },
      { text: 'Datasets', icon: <StorageIcon />, path: '/dashboard/datasets' },
      { text: 'Subscriptions', icon: <SubscriptionsIcon />, path: '/dashboard/subscriptions' },
      { text: 'Tags', icon: <CircleIcon />, path: '/dashboard/tags' },
    ]
  },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAIConfigured, setOpenAIConfigured] = useState(false);
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { tenants, selectedTenantId, setSelectedTenantId, canSwitchTenants } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if OpenAI integration is configured for the current tenant
  useEffect(() => {
    const checkOpenAIIntegration = async () => {
      console.log('Checking OpenAI integration status for tenant...');
      try {
        // Use the dedicated endpoint which now checks tenant-based configuration
        console.log('Calling /api/openai-integration endpoint...');
        const response = await axios.get('/api/openai-integration');
        console.log('OpenAI integration response:', response.status, response.data);

        if (response.data.status === 'configured') {
          console.log('OpenAI integration is configured for the current tenant');
          setOpenAIConfigured(true);
        } else {
          console.log('OpenAI integration not configured for the current tenant:', response.data.status);
          setOpenAIConfigured(false);
        }
      } catch (error) {
        console.error('Error checking OpenAI integration:', error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);

          // Handle authentication errors
          if (error.response.status === 401) {
            console.error('Authentication error when checking OpenAI integration.');
            // If authentication fails, redirect to login
            logout();
            navigate('/login');
            return;
          }
        }
        console.log('Setting openAIConfigured to false due to error');
        setOpenAIConfigured(false);
      }
    };

    checkOpenAIIntegration();
  }, [selectedTenantId]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [openItem, setOpenItem] = useState('');

  const handleItemClick = (itemText) => {
    setOpenItem(openItem === itemText ? '' : itemText);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ flexDirection: 'column', py: 2 }}>
        <Avatar 
          src={darkMode ? (settings?.branding?.darkLogo || settings?.branding?.logo || '/logo.png') : (settings?.branding?.logo || '/logo.png')} 
          alt="Logo"
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 1,
            borderRadius: 1
          }}
          variant="square"
        />
        <Typography variant="h6" noWrap component="div" align="center">
          {settings?.general?.siteName || 'RabbitAI Admin'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Skip items with conditions that aren't met
          if (item.condition === 'openAIConfigured' && !openAIConfigured) {
            return null;
          }

          return (
            <React.Fragment key={item.text}>
              {item.subItems ? (
                <>
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleItemClick(item.text)}
                      selected={location.pathname.startsWith(item.path)}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                      {openItem === item.text ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={openItem === item.text} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding>
                          <ListItemButton 
                            selected={location.pathname === subItem.path}
                            onClick={() => navigate(subItem.path)}
                            sx={{ pl: 4 }}
                          >
                            <ListItemIcon>
                              {subItem.icon || <CircleIcon sx={{ fontSize: 10 }} />}
                            </ListItemIcon>
                            <ListItemText primary={subItem.text} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding>
                  <ListItemButton 
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => 
              item.path === location.pathname || 
              (item.subItems && item.subItems.some(subItem => subItem.path === location.pathname))
            )?.text || 'Home'}
          </Typography>
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              size="large"
              onClick={toggleTheme}
              color="inherit"
              sx={{ mr: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          {canSwitchTenants && (
            <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel id="tenant-select-label">Tenant</InputLabel>
              <Select
                labelId="tenant-select-label"
                value={selectedTenantId || ''}
                label="Tenant"
                onChange={(e) => setSelectedTenantId(e.target.value)}
              >
                {tenants.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {currentUser?.picture ? (
              <Avatar src={currentUser.picture} alt={currentUser.name} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {currentUser?.name || currentUser?.email || 'User'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate('/dashboard/profile')}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Floating Chat Icon */}
      {openAIConfigured && <FloatingChat />}
    </Box>
  );
}
