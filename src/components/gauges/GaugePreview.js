import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import chart components
import NumberCard from '../charts/NumberCard';
import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';

/**
 * Component for previewing gauge visualizations
 */
function GaugePreview({
  gaugeType,
  previewData,
  loading,
  error,
  onRefresh
}) {
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading preview...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!previewData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No preview available. Configure your gauge and click "Preview" to see a visualization.
        </Typography>
        <Button 
          variant="contained" 
          onClick={onRefresh}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Generate Preview
        </Button>
      </Box>
    );
  }

  // Render the appropriate chart based on gauge type
  return (
    <Box sx={{ p: 2 }}>
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 2, 
          height: '100%', 
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {gaugeType === 'number' && (
          <NumberCard 
            value={previewData.value || 0} 
            label={previewData.label || 'Value'} 
            trend={previewData.trend} 
            trendValue={previewData.trendValue}
          />
        )}
        
        {gaugeType === 'pie' && (
          <PieChart 
            data={previewData.data || []} 
            title={previewData.title || 'Pie Chart'} 
          />
        )}
        
        {gaugeType === 'bar' && (
          <BarChart 
            data={previewData.data || []} 
            title={previewData.title || 'Bar Chart'} 
            xAxisLabel={previewData.xAxisLabel || 'Category'} 
            yAxisLabel={previewData.yAxisLabel || 'Value'} 
          />
        )}
        
        {gaugeType === 'line' && (
          <LineChart 
            data={previewData.data || []} 
            title={previewData.title || 'Line Chart'} 
            xAxisLabel={previewData.xAxisLabel || 'Time'} 
            yAxisLabel={previewData.yAxisLabel || 'Value'} 
          />
        )}
      </Paper>
    </Box>
  );
}

export default GaugePreview;