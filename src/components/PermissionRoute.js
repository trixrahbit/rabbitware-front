import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A route component that checks if the user has the required permission
 * before rendering the child component.
 * 
 * @param {Object} props - Component props
 * @param {string} props.resource - The resource to check permission for
 * @param {string} props.action - The action to check permission for (view, create, edit, delete)
 * @param {React.ReactNode} props.children - The component to render if permission is granted
 * @param {string} [props.fallbackPath='/dashboard'] - The path to redirect to if permission is denied
 * @returns {React.ReactNode} - The child component or a redirect
 */
const PermissionRoute = ({ resource, action, children, fallbackPath = '/dashboard' }) => {
  const { hasPermission } = usePermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await hasPermission(resource, action);
        setHasAccess(result);
      } catch (error) {
        console.error(`Error checking permission for ${resource}:${action}:`, error);
        setHasAccess(false);
      } finally {
        setPermissionChecked(true);
      }
    };

    checkPermission();
  }, [resource, action, hasPermission]);

  if (!permissionChecked) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  if (!hasAccess) {
    return <Navigate to={fallbackPath} state={{ from: location, permissionDenied: true }} />;
  }

  return children;
};

export default PermissionRoute;