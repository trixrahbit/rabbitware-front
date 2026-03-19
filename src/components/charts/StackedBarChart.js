import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#1976d2', '#9c27b0', '#ed6c02', '#2e7d32', '#d32f2f', '#0288d1', '#7b1fa2', '#f57c00'];

const StackedBarChart = ({ title, data, loading, error, xAxisLabel, yAxisLabel, dataKeys, horizontal }) => {
  const keys = dataKeys || (data && data.length > 0
    ? Object.keys(data[0]).filter(k => k !== 'name' && k !== '_time_bucket')
    : ['value']);

  const xDataKey = data?.[0]?._time_bucket !== undefined ? '_time_bucket' : 'name';

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
              <RechartsBarChart
                data={data}
                layout={horizontal ? 'vertical' : 'horizontal'}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {horizontal ? (
                  <>
                    <YAxis type="category" dataKey={xDataKey} />
                    <XAxis type="number" />
                  </>
                ) : (
                  <>
                    <XAxis dataKey={xDataKey} label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                  </>
                )}
                <Tooltip />
                <Legend />
                {keys.map((key, i) => (
                  <Bar key={key} dataKey={key} name={key} stackId="stack"
                       fill={COLORS[i % COLORS.length]} />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StackedBarChart;
