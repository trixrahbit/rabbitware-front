import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TenantContext = createContext();
export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tenants, setTenants] = useState([]);

  const canSwitchTenants =
    currentUser?.role === 'Admin' &&
    currentUser?.tenant_id === 1 &&
    currentUser?.domain === 'webitservices.com';

  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    return (
      (canSwitchTenants && localStorage.getItem('selectedTenantId')) ||
      currentUser?.tenant_id ||
      null
    );
  });

  useEffect(() => {
    if (canSwitchTenants) {
      const fetchTenants = async () => {
        try {
          const res = await axios.get('/api/tenants');
          setTenants(res.data);
        } catch (e) {
          console.error('Error fetching tenants', e);
        }
      };
      fetchTenants();
    } else {
      setTenants([]);
    }
  }, [currentUser, canSwitchTenants]);

  useEffect(() => {
    if (canSwitchTenants && selectedTenantId) {
      localStorage.setItem('selectedTenantId', selectedTenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
  }, [selectedTenantId, canSwitchTenants]);

  useEffect(() => {
    if (currentUser) {
      setSelectedTenantId(currentUser.tenant_id);
      if (!canSwitchTenants) {
        localStorage.removeItem('selectedTenantId');
      }
    }
  }, [currentUser, canSwitchTenants]);

  const value = {
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    canSwitchTenants
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

