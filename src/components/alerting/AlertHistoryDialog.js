import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip
} from '@mui/material';

/**
 * Dialog component for displaying alert execution history
 */
function AlertHistoryDialog({
  open,
  onClose,
  alertName,
  alertHistory,
  loading
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="alert-history-dialog-title"
    >
      <DialogTitle id="alert-history-dialog-title">
        Execution History: {alertName}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : alertHistory.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No execution history found for this alert.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Execution Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{new Date(history.execution_time).toLocaleString()}</TableCell>
                    <TableCell>
                      {history.status === 'success' ? (
                        <Chip label="Success" color="success" />
                      ) : history.status === 'skipped' ? (
                        <Chip label="Skipped" color="warning" />
                      ) : (
                        <Chip label="Failure" color="error" />
                      )}
                    </TableCell>
                    <TableCell>
                      {history.status === 'failure' ? (
                        <Typography variant="body2" color="error">
                          {history.error_message}
                        </Typography>
                      ) : history.result_data ? (
                        <Typography variant="body2">
                          {history.result_data.message || 'No details available'}
                          {history.result_data.data_count !== undefined && (
                            <span> ({history.result_data.data_count} items)</span>
                          )}
                        </Typography>
                      ) : (
                        'No details available'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertHistoryDialog;