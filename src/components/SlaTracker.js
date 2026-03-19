import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MDProgress from './MDProgress';

export default function SlaTracker({ ticketId }) {
  const [slaInfo, setSlaInfo] = useState(null);

  useEffect(() => {
    if (!ticketId) return;

    const fetchSla = async () => {
      try {
        const response = await axios.get(`/api/tickets/${ticketId}/sla`);
        setSlaInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch SLA info', error);
      }
    };

    fetchSla();
  }, [ticketId]);

  if (!slaInfo) return null;

  const percentage = Math.min(100, Math.round((slaInfo.sla_percentage || 0) * 100));
  const breached = percentage >= 100;
  const deadline = slaInfo.sla_deadline ? new Date(slaInfo.sla_deadline) : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        SLA Progress
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <MDProgress value={percentage} color={breached ? 'error' : 'success'} />
        <Typography
          variant="caption"
          sx={{ position: 'absolute', top: -20, left: `${percentage}%`, transform: 'translateX(-50%)' }}
        >
          {percentage}%
        </Typography>
        {breached && (
          <CloseIcon color="error" sx={{ position: 'absolute', right: -20, top: -6 }} />
        )}
      </Box>
      {deadline && (
        <Typography variant="caption" color="text.secondary">
          Deadline: {deadline.toLocaleString()}
        </Typography>
      )}
    </Box>
  );
}

SlaTracker.propTypes = {
  ticketId: PropTypes.number.isRequired,
};
