import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis
} from 'recharts';

const ScatterChart = ({ title, data, loading, error, xAxisLabel, yAxisLabel, xKey = 'x', yKey = 'y', zKey }) => {
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
              <RechartsScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey={xKey} name={xAxisLabel || xKey}
                       label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey={yKey} name={yAxisLabel || yKey}
                       label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                {zKey && <ZAxis type="number" dataKey={zKey} range={[50, 400]} />}
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name={title || 'Data'} data={data} fill="#1976d2" />
              </RechartsScatterChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ScatterChart;
