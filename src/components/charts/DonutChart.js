import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1976d2', '#9c27b0', '#ed6c02', '#2e7d32', '#d32f2f', '#0288d1', '#7b1fa2', '#f57c00'];

const DonutChart = ({ title, data, loading, error, nameKey = 'name', valueKey = 'value' }) => {
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
              <PieChart>
                <Pie data={data} dataKey={valueKey} nameKey={nameKey}
                     cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                     paddingAngle={2} label>
                  {data && data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DonutChart;
