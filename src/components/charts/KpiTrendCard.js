import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const KpiTrendCard = ({ title, currentValue, previousValue, changePercent, trend, loading, error, format, suffix }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (format === 'currency') return `$${Number(val).toLocaleString()}`;
    if (format === 'percent') return `${Number(val).toFixed(1)}%`;
    if (typeof val === 'number') return Number(val).toLocaleString();
    return val;
  };

  const trendColor = trend === 'up' ? '#2e7d32' : trend === 'down' ? '#d32f2f' : '#757575';
  const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : TrendingFlatIcon;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error">Error</Typography>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {formatValue(currentValue)}{suffix || ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendIcon sx={{ color: trendColor, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: trendColor, fontWeight: 'medium' }}>
                {changePercent !== null && changePercent !== undefined
                  ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`
                  : '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                vs {formatValue(previousValue)} prev
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiTrendCard;
