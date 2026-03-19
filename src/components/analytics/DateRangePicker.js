import React, { useState } from 'react';
import {
  Box, Button, ButtonGroup, TextField, Popover, Typography, Divider, Stack
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: 'this_month' },
  { label: 'Last month', days: 'last_month' },
  { label: 'This quarter', days: 'this_quarter' },
  { label: 'This year', days: 'this_year' },
];

function getPresetRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start, end;

  if (typeof preset.days === 'number') {
    end = today;
    if (preset.days === 0) {
      start = today;
    } else if (preset.days === 1) {
      start = new Date(today); start.setDate(start.getDate() - 1);
      end = new Date(start);
    } else {
      start = new Date(today); start.setDate(start.getDate() - preset.days);
    }
  } else if (preset.days === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = today;
  } else if (preset.days === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (preset.days === 'this_quarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), qStart, 1);
    end = today;
  } else if (preset.days === 'this_year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = today;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

const DateRangePicker = ({ startDate, endDate, onChange, label }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePreset = (preset) => {
    const { start, end } = getPresetRange(preset);
    onChange({ start, end });
    setAnchorEl(null);
  };

  const displayText = startDate && endDate
    ? `${startDate} - ${endDate}`
    : label || 'Select date range';

  return (
    <Box>
      <Button
        variant="outlined" size="small" startIcon={<CalendarTodayIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ textTransform: 'none', minWidth: 200 }}
      >
        {displayText}
      </Button>
      <Popover
        open={Boolean(anchorEl)} anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 340 }}>
          <Typography variant="subtitle2" gutterBottom>Quick Ranges</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {PRESETS.map((p) => (
              <Button key={p.label} size="small" variant="text" onClick={() => handlePreset(p)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                {p.label}
              </Button>
            ))}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Custom Range</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              type="date" size="small" label="Start" InputLabelProps={{ shrink: true }}
              value={startDate || ''} onChange={(e) => onChange({ start: e.target.value, end: endDate })}
            />
            <TextField
              type="date" size="small" label="End" InputLabelProps={{ shrink: true }}
              value={endDate || ''} onChange={(e) => onChange({ start: startDate, end: e.target.value })}
            />
          </Stack>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => { onChange({ start: null, end: null }); setAnchorEl(null); }}>
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={() => setAnchorEl(null)} sx={{ ml: 1 }}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;
