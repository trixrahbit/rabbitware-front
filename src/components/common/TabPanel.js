import React from 'react';
import { Box } from '@mui/material';

/**
 * A reusable TabPanel component for Material-UI tabs
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display in the tab panel
 * @param {number} props.value - The current tab value
 * @param {number} props.index - The index of this tab panel
 * @param {string} [props.prefix='tab'] - Prefix for the aria-labelledby attribute
 * @param {Object} [props.other] - Additional props to pass to the div
 */
function TabPanel(props) {
  const { children, value, index, prefix = 'tab', ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${prefix}-tabpanel-${index}`}
      aria-labelledby={`${prefix}-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default TabPanel;