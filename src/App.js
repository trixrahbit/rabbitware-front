
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSettings } from './contexts/SettingsContext';
import { Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { PermissionProvider } from './contexts/PermissionContext';
import PermissionRoute from './components/PermissionRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Tickets from './pages/Tickets';
import NextTicket from './pages/NextTicket';
import Contracts from './pages/Contracts';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Integrations from './pages/Integrations';
import NotFound from './pages/NotFound';
// New pages
import Companies from './pages/Companies';
import UserProfile from './pages/UserProfile';
import NextTicketSettings from './pages/NextTicketSettings';
import Alerting from './pages/Alerting';
import Analytics from './pages/Analytics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DataSources from './pages/DataSources';
import Datasets from './pages/Datasets';
import Subscriptions from './pages/Subscriptions';
import Tags from './pages/Tags';
import Gauges from './pages/Gauges';
import GaugeDetail from './pages/GaugeDetail';
import ChatWithAI from './pages/ChatWithAI';
import ChatWithClaude from './pages/ChatWithClaude';
import AiApps from './pages/AiApps';
import Orchestration from './pages/Orchestration';
import SelfHealing from './pages/SelfHealing';
import SelfHealingProfiles from './pages/SelfHealingProfiles';
import Monitoring from './pages/Monitoring';
import CompanyMapping from './pages/CompanyMapping';
import Calendars from './pages/Calendars';
import AutoDispatch from './pages/AutoDispatch';
import AutoDispatchSkills from './pages/AutoDispatchSkills';
import AutoDispatchRules from './pages/AutoDispatchRules';
import AutoDispatchUserSkills from './pages/AutoDispatchUserSkills';
import AutoDispatchBusinessHours from './pages/AutoDispatchBusinessHours';
import Devices from './pages/Devices';
import Tenants from './pages/Tenants';

// Layout
import DashboardLayout from './components/layouts/DashboardLayout';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();

  // Wait for auth to load
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const { currentUser, loading: authLoading } = useAuth();

  // Wait for auth to load
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <PermissionProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/m365-callback" element={<Login isCallback />} />
          <Route path="/auth/callback" element={<Login isCallback />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="next-ticket-settings" element={<NextTicketSettings />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="next-ticket" element={<NextTicket />} />
            <Route path="companies" element={<Companies />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="users" element={
              <PermissionRoute resource="users" action="view">
                <Users />
              </PermissionRoute>
            } />
            <Route path="roles" element={
              <PermissionRoute resource="roles" action="view">
                <Roles />
              </PermissionRoute>
            } />
            <Route path="tenants" element={
              <PermissionRoute resource="tenants" action="view">
                <Tenants />
              </PermissionRoute>
            } />
            <Route path="integrations" element={<Integrations />} />
            <Route path="alerting" element={<Alerting />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics/dashboard/:dashboardId" element={<AnalyticsDashboard />} />
            <Route path="analytics/gauges" element={<Gauges />} />
            <Route path="analytics/gauges/create" element={<GaugeDetail isCreating />} />
            <Route path="analytics/gauges/:gaugeId" element={<GaugeDetail />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="subscriptions" element={
              <PermissionRoute resource="subscriptions" action="view">
                <Subscriptions />
              </PermissionRoute>
            } />
            <Route path="tags" element={<Tags />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="chat-with-ai" element={<ChatWithAI />} />
            <Route path="chat-with-claude" element={<ChatWithClaude />} />
            <Route path="ai-apps" element={<AiApps />} />
            <Route path="orchestration" element={
              <PermissionRoute resource="orchestration" action="view">
                <Orchestration />
              </PermissionRoute>
            } />
            <Route path="self-healing" element={<SelfHealing />} />
            <Route path="self-healing/profiles" element={<SelfHealingProfiles />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="devices" element={<Devices />} />
            <Route path="companies/:companyId/devices" element={<Devices />} />
            <Route path="company-mapping" element={<CompanyMapping />} />
            <Route path="calendars" element={
              <PermissionRoute resource="calendar" action="view">
                <Calendars />
              </PermissionRoute>
            } />

            <Route path="auto-dispatch" element={
              <PermissionRoute resource="autodispatch" action="view">
                <AutoDispatch />
              </PermissionRoute>
            } />
            <Route path="auto-dispatch/skills" element={
              <PermissionRoute resource="autodispatch" action="view">
                <AutoDispatchSkills />
              </PermissionRoute>
            } />
            <Route path="auto-dispatch/user-skills" element={
              <PermissionRoute resource="autodispatch" action="view">
                <AutoDispatchUserSkills />
              </PermissionRoute>
            } />
            <Route path="auto-dispatch/rules" element={
              <PermissionRoute resource="autodispatch" action="view">
                <AutoDispatchRules />
              </PermissionRoute>
            } />
            <Route path="auto-dispatch/business-hours" element={
              <PermissionRoute resource="autodispatch" action="view">
                <AutoDispatchBusinessHours />
              </PermissionRoute>
            } />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PermissionProvider>
    </SnackbarProvider>
  );
}

export default App;
