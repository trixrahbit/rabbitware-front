import React, { createContext, useContext, useState } from 'react';

// Create context
const MaterialUIContext = createContext();

// Custom hook to use the Material UI context
export const useMaterialUIController = () => useContext(MaterialUIContext);

// Provider component
export const MaterialUIControllerProvider = ({ children }) => {
  // State for dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Value to be provided to consumers
  const value = [
    {
      darkMode,
      toggleDarkMode,
    },
  ];

  return (
    <MaterialUIContext.Provider value={value}>
      {children}
    </MaterialUIContext.Provider>
  );
};