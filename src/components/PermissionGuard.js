import React, { useEffect, useState } from 'react';
import { usePermission } from '../contexts/PermissionContext';

/**
 * A component that conditionally renders its children based on whether
 * the user has the required permission.
 * 
 * @param {Object} props - Component props
 * @param {string} props.resource - The resource to check permission for
 * @param {string} props.action - The action to check permission for (view, create, edit, delete)
 * @param {React.ReactNode} props.children - The content to render if permission is granted
 * @param {React.ReactNode} [props.fallback=null] - The content to render if permission is denied
 * @returns {React.ReactNode} - The children or fallback content
 */
const PermissionGuard = ({ resource, action, children, fallback = null }) => {
  const { hasPermission } = usePermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

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
    return null; // Don't render anything while checking permissions
  }

  return hasAccess ? children : fallback;
};

export default PermissionGuard;