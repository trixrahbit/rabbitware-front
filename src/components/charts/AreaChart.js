import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#1976d2', '#9c27b0', '#ed6c02', '#2e7d32', '#d32f2f', '#0288d1'];

const AreaChart = ({ title, data, loading, error, xAxisLabel, yAxisLabel, dataKeys, stacked }) => {
  const keys = dataKeys || (data && data.length > 0
    ? Object.keys(data[0]).filter(k => k !== 'name' && k !== '_time_bucket')
    : ['value']);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {title && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {title}
          </Typography>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ py: 2 }}>Error loading data</Typography>
        ) : (
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={data?.[0]?._time_bucket !== undefined ? '_time_bucket' : 'name'}
                       label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {keys.map((key, i) => (
                  <Area key={key} type="monotone" dataKey={key} name={key}
                        fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]}
                        fillOpacity={0.3} stackId={stacked ? 'stack' : undefined} />
                ))}
              </RechartsAreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AreaChart;
