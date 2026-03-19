import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const usePermission = () => useContext(PermissionContext);

export function PermissionProvider({ children }) {
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user permissions when the user changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!currentUser) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/api/users/permissions');
        setPermissions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError('Failed to load permissions');
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [currentUser]);

  // Check if user has permission for a specific resource and action
  const hasPermission = async (resource, action) => {
    if (!currentUser) return false;

    try {
      const response = await axios.get(`/api/users/check-permission?resource=${resource}&action=${action}`);
      return response.data.hasPermission;
    } catch (err) {
      console.error(`Error checking permission for ${resource}:${action}:`, err);
      return false;
    }
  };

  // Check if user has permission for a specific resource and action (synchronous version using cached permissions)
  const hasPermissionSync = (resource, action) => {
    if (!currentUser || loading) return false;
    
    return permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  return (
    <PermissionContext.Provider value={{
      permissions,
      loading,
      error,
      hasPermission,
      hasPermissionSync
    }}>
      {children}
    </PermissionContext.Provider>
  );
}