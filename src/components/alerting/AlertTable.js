import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  Link as LinkIcon
} from '@mui/icons-material';

/**
 * Component for displaying alerts in a table format
 */
function AlertTable({
  alerts,
  onEdit,
  onDelete,
  onRunNow,
  onViewHistory
}) {
  return (
    <Box>
      {alerts.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No alerts have been created yet. Click the "Create Alert" button to create your first alert.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Data Source</TableCell>
                <TableCell>Action Type</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Tooltip title={alert.description || 'No description'}>
                      <span>{alert.name}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{alert.data_source || 'Integration'}</TableCell>
                  <TableCell>
                    <Tooltip title={alert.action_type === 'teams_bot' ? 'Microsoft Teams Bot' : 'Webhook'}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {alert.action_type === 'teams_bot' ? (
                          <ChatIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        ) : (
                          <LinkIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
                        )}
                        <Chip 
                          label={alert.action_type === 'teams_bot' ? 'Teams' : 'Webhook'} 
                          color={alert.action_type === 'teams_bot' ? 'primary' : 'secondary'} 
                          size="small"
                        />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{alert.frequency ? alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1) : 'Unknown'}</TableCell>
                  <TableCell>{alert.last_run ? new Date(alert.last_run).toLocaleString() : 'Never'}</TableCell>
                  <TableCell>
                    {alert.is_active ? (
                      <Chip label="Active" color="success" />
                    ) : (
                      <Chip label="Inactive" color="default" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => onRunNow(alert.id)}
                      title="Run Alert"
                      aria-label="Run alert"
                    >
                      <RunIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => onViewHistory(alert.id)}
                      title="View History"
                      aria-label="View alert history"
                    >
                      <HistoryIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => onEdit(alert)}
                      title="Edit Alert"
                      aria-label="Edit alert"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => onDelete(alert.id)}
                      title="Delete Alert"
                      aria-label="Delete alert"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AlertTable;