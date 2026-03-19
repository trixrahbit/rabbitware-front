import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create context
const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      siteName: 'RabbitAI Admin',
      companyName: 'WEBIT',
      supportEmail: 'support@example.com',
      apiUrl: window.location.origin,
      timezone: 'UTC'
    },
    authentication: {
      allowEmailLogin: true,
      allowM365Login: true,
      requireMFA: false,
      sessionTimeout: 60,
      allowedDomains: []
    },
    notifications: {
      emailNotifications: true,
      slackNotifications: false,
      slackWebhookUrl: '',
      notifyOnTicketCreated: true,
      notifyOnTicketUpdated: true,
      notifyOnSystemErrors: true
    },
    integration: {
      autotaskApiUrl: '',
      autotaskUsername: '',
      autotaskPassword: '********',
      autotaskIntegrationCode: '********',
      syncInterval: 60
    },
    sla: {
      enabled: true,
      defaultSlaHours: 24,
      highPrioritySlaHours: 8,
      mediumPrioritySlaHours: 16,
      lowPrioritySlaHours: 24,
      criticalPrioritySlaHours: 4,
      warningThreshold: 0.75,
      checkInterval: 15
    },
    businessHours: {
      businessHoursStart: 9,
      businessHoursEnd: 17,
      businessDays: 'Monday,Tuesday,Wednesday,Thursday,Friday'
    },
    branding: {
      logo: '/logo.png',
      darkLogo: '/logo.png',
      darkMode: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a ref to track if a fetch is in progress to prevent duplicate calls
  const fetchInProgress = useRef(false);
  // Add a ref to track the last fetch time to implement debouncing
  const lastFetchTime = useRef(0);
  // Debounce time in milliseconds
  const DEBOUNCE_TIME = 1000;

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    // Check if a fetch is already in progress
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping duplicate call');
      return;
    }

    // Check if we need to debounce
    const now = Date.now();
    if (now - lastFetchTime.current < DEBOUNCE_TIME) {
      console.log('Debouncing settings fetch call');
      return;
    }

    // Only set loading to true if we don't already have settings
    const shouldSetLoading = !settings || Object.keys(settings).length === 0;

    try {
      // Set fetch in progress flag
      fetchInProgress.current = true;
      // Update last fetch time
      lastFetchTime.current = now;

      if (shouldSetLoading) {
        setLoading(true);
      }

      // Fetch general settings
      const settingsResponse = await axios.get('/api/settings');

      // Map database settings to the frontend settings object
      const data = settingsResponse.data;

      // If we have branding settings from the database, map them correctly
      if (data.branding_settings) {
        data.branding = {
          logo: data.branding_settings.logo || '/logo.png',
          darkLogo: data.branding_settings.dark_logo || data.branding_settings.logo || '/logo.png',
          darkMode: data.branding_settings.dark_mode || false
        };

        // Remove the raw branding_settings to avoid duplication
        delete data.branding_settings;
      }

      // Fetch logo metadata from the new endpoint
      try {
        const logoResponse = await axios.get('/api/branding/logo');
        const logoData = logoResponse.data;

        // Update the logo URL in the settings
        if (logoData && logoData.url) {
          console.log('Fetched logo from endpoint:', logoData.url);

          // Make sure branding object exists
          if (!data.branding) {
            data.branding = {
              darkMode: false
            };
          }

          // Update logo URL
          data.branding.logo = logoData.url;

          // If no dark logo is set, use the same logo for dark mode
          if (!data.branding.darkLogo) {
            data.branding.darkLogo = logoData.url;
          }
        }
      } catch (logoErr) {
        console.error('Error fetching logo metadata:', logoErr);
        // Continue with the existing logo settings
      }

      setSettings(data);

      if (shouldSetLoading) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');

      if (shouldSetLoading) {
        setLoading(false);
      }
    } finally {
      // Clear fetch in progress flag
      fetchInProgress.current = false;
    }
  }, [settings]);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    // Check if an update is already in progress
    if (fetchInProgress.current) {
      console.log('Update already in progress, skipping duplicate call');
      return false;
    }

    // Check if we need to debounce
    const now = Date.now();
    if (now - lastFetchTime.current < DEBOUNCE_TIME) {
      console.log('Debouncing settings update call');
      return false;
    }

    try {
      // Set fetch in progress flag
      fetchInProgress.current = true;
      // Update last fetch time
      lastFetchTime.current = now;

      // Don't set loading to true here to prevent reload loops
      // The component calling this function should handle its own loading state

      // Create a copy of the settings to send to the API
      const settingsToSave = { ...newSettings };

      // If we have branding settings, format them for the database
      if (settingsToSave.branding) {
        settingsToSave.branding_settings = {
          logo: settingsToSave.branding.logo,
          dark_logo: settingsToSave.branding.darkLogo,
          dark_mode: settingsToSave.branding.darkMode
        };
      }

      await axios.post('/api/settings', settingsToSave);
      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      return false;
    } finally {
      // Clear fetch in progress flag
      fetchInProgress.current = false;
    }
  }, []);

  // Initialize settings when the component mounts, but only if they haven't been loaded yet
  // AND only if the user is authenticated
  // This ensures that settings are loaded once when the application starts, but not repeatedly
  useEffect(() => {
    // Don't fetch settings if user is not authenticated
    if (!currentUser) {
      console.log('User not authenticated, skipping settings fetch');
      return;
    }

    // Check if settings have already been loaded
    if (settings && Object.keys(settings).length > 0) {
      console.log('Settings already loaded, skipping initial fetch');
      return;
    }

    // Check if a fetch is already in progress
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping initial fetch');
      return;
    }

    console.log('Initializing settings on component mount');
    fetchSettings();
  }, [fetchSettings, currentUser, settings]);

  const value = {
    settings,
    setSettings,
    loading,
    setLoading,
    error,
    setError,
    fetchSettings,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
