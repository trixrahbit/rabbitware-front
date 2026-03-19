import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, MenuItem, TextField, Typography, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';

const INTERVALS = [
  { value: 0, label: 'Off' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 600, label: '10m' },
  { value: 1800, label: '30m' },
];

const AutoRefresh = ({ onRefresh, compact }) => {
  const [interval, setInterval_] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (interval > 0 && onRefresh) {
      timerRef.current = setInterval(onRefresh, interval * 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [interval, onRefresh]);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Refresh now">
          <IconButton size="small" onClick={onRefresh}><RefreshIcon fontSize="small" /></IconButton>
        </Tooltip>
        <TextField
          select size="small" value={interval}
          onChange={(e) => setInterval_(Number(e.target.value))}
          sx={{ width: 80 }}
          InputProps={{ startAdornment: interval > 0
            ? <TimerIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
            : <TimerOffIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          }}
        >
          {INTERVALS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="Refresh now">
        <IconButton size="small" onClick={onRefresh}><RefreshIcon /></IconButton>
      </Tooltip>
      <Typography variant="body2" color="text.secondary">Auto-refresh:</Typography>
      <TextField
        select size="small" value={interval}
        onChange={(e) => setInterval_(Number(e.target.value))}
        sx={{ width: 100 }}
      >
        {INTERVALS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default AutoRefresh;
