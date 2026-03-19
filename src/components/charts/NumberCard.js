import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

/**
 * Display a numeric value with an optional trend indicator.
 */
const NumberCard = ({
  value,
  label,
  trend,
  trendValue,
  loading,
  error
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {label && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {label}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ py: 2 }}>
            Error loading data
          </Typography>
        ) : (
          <>
            <Typography variant="h3" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              {value}
              {trend && (
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {trend === 'up' ? (
                    <ArrowUpward color="success" fontSize="inherit" />
                  ) : (
                    <ArrowDownward color="error" fontSize="inherit" />
                  )}
                  {trendValue !== undefined && (
                    <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                      {trendValue}
                    </Typography>
                  )}
                </Box>
              )}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NumberCard;