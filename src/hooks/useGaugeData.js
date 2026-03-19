import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching gauge-related data
 */
function useGaugeData(gaugeId = null, isCreating = false) {
  const [loading, setLoading] = useState(true);
  const [gauge, setGauge] = useState(null);
  const [datasources, setDatasources] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [integrationsError, setIntegrationsError] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);
  const [showNoIntegrationsAlert, setShowNoIntegrationsAlert] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchDatasources(),
          fetchIntegrations(),
          fetchCategories(),
          fetchTags(),
          fetchFolders()
        ]);

        if (!isCreating && gaugeId) {
          await fetchGauge(gaugeId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [gaugeId, isCreating]);

  const fetchDatasources = async () => {
    try {
      const response = await axios.get('/api/analytics/datasources');
      setDatasources(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching datasources:', error);
      setError('Failed to load datasources. Please try again.');
      return [];
    }
  };

  const fetchIntegrations = async () => {
    try {
      setIntegrationsLoading(true);
      setIntegrationsError(null);
      
      const response = await axios.get('/api/integrations');
      setIntegrations(response.data);

      // Check if there are any integrations
      if (response.data.length === 0) {
        setShowNoIntegrationsAlert(true);
      } else {
        setShowNoIntegrationsAlert(false);
      }

      setIntegrationsLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrationsError('Failed to load integrations. Please try again.');
      setIntegrationsLoading(false);
      return [];
    }
  };

  const fetchDatasets = async (integrationId) => {
    try {
      if (!integrationId) {
        setDatasets([]);
        return [];
      }

      const selectedIntegration = integrations.find(
        integration => integration.id.toString() === integrationId.toString()
      );

      if (!selectedIntegration) {
        setDatasets([]);
        return [];
      }

      // Try to fetch datasets from the API
      try {
        const url = `/api/datasets?integration_id=${integrationId}`;
        const response = await axios.get(url);
        setDatasets(response.data);
        return response.data;
      } catch (apiError) {
        console.error('Error fetching datasets from API:', apiError);
        
        // Fallback to mock datasets if API fails
        const mockDatasets = [
          { id: 'tickets', name: 'Tickets' },
          { id: 'companies', name: 'Companies' },
          { id: 'contacts', name: 'Contacts' }
        ];
        
        setDatasets(mockDatasets);
        return mockDatasets;
      }
    } catch (error) {
      console.error('Error in fetchDatasets:', error);
      setDatasets([]);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/analytics/categories');
      setCategories(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use mock data if API fails
      const mockCategories = [
        { id: 1, name: 'Performance' },
        { id: 2, name: 'Tickets' },
        { id: 3, name: 'Financial' }
      ];
      setCategories(mockCategories);
      return mockCategories;
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'gauge' }
      });
      setTags(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
      return [];
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/analytics/folders');
      setFolders(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      // Use mock data if API fails
      const mockFolders = [
        { id: 1, name: 'Main Dashboard' },
        { id: 2, name: 'Ticket Reports' },
        { id: 3, name: 'Executive View' }
      ];
      setFolders(mockFolders);
      return mockFolders;
    }
  };

  const fetchGauge = async (id) => {
    try {
      const response = await axios.get(`/api/analytics/gauges/${id}`);
      setGauge(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching gauge:', error);
      setError('Failed to load gauge. Please try again.');
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    gauge,
    datasources,
    integrations,
    integrationsLoading,
    integrationsError,
    datasets,
    categories,
    tags,
    folders,
    error,
    showNoIntegrationsAlert,
    fetchDatasets,
    fetchGauge
  };
}

export default useGaugeData;