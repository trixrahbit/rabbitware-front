import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Import base theme elements
import baseColors from '../theme';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

// Create context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { settings, loading, fetchSettings } = useSettings();
  const { currentUser } = useAuth();

  // Check if user has a theme preference in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    // First check if there's a user preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // If no user preference, use the default from settings (if available)
    return settings?.branding?.darkMode || false;
  });

  // Fetch settings when the component mounts to ensure we have the latest branding settings
  // This is needed because we no longer load settings on startup
  useEffect(() => {
    // Don't fetch settings if user is not authenticated
    if (!currentUser) {
      console.log('User not authenticated, skipping theme settings fetch');
      return;
    }

    // Only fetch settings if they haven't been loaded yet
    if (!settings?.branding) {
      fetchSettings();
    }
  }, [fetchSettings, settings, currentUser]);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Create themes based on mode
  const createCustomTheme = (mode) => {
    // Default colors for light and dark modes
    const primaryColor = '#268f3b';
    const secondaryColor = '#0071bb';
    const fontColor = '#495057';

    // Theme-specific colors
    const lightSidenavColor = '#ffffff';
    const lightSidenavTextColor = '#495057';
    const darkSidenavColor = '#2a2d3e';
    const darkSidenavTextColor = '#ffffff';

    // Common components styling for both light and dark modes
    const commonComponents = {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 10px 0 rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 15px 0 rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
            },
          },
        },
      },
    };

    if (mode === 'light') {
      return createTheme({
        ...baseColors,
        palette: {
          ...baseColors.palette,
          mode: 'light',
          primary: {
            main: primaryColor,
            focus: primaryColor,
          },
          secondary: {
            main: secondaryColor,
            focus: secondaryColor,
          },
          text: {
            primary: fontColor,
            secondary: '#6c757d',
          },
          typography: {
            h4: {
              color: fontColor,
            },
            body1: {
              color: mode === 'dark' ? '#ffffff' : fontColor,
            },
          },
          background: {
            default: '#f8f9fa',
            paper: '#ffffff',
          },
        },
        components: {
          ...baseColors.components,
          ...commonComponents,
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: lightSidenavColor,
                color: lightSidenavTextColor,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: lightSidenavColor,
                color: lightSidenavTextColor,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                '& .MuiListItemIcon-root': {
                  color: lightSidenavTextColor,
                },
                '& .MuiListItemText-root': {
                  color: lightSidenavTextColor,
                },
                '& .MuiDivider-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#f8f9fa',
                color: fontColor,
              }
            }
          },
        },
      });
    } else {
      return createTheme({
        ...baseColors,
        palette: {
          ...baseColors.palette,
          mode: 'dark',
          primary: {
            main: primaryColor,
            focus: primaryColor,
          },
          secondary: {
            main: secondaryColor,
            focus: secondaryColor,
          },
          background: {
            default: '#1a1d2a',
            paper: '#252836',
          },
          text: {
            primary: '#ffffff',
            secondary: '#adb5bd',
          },
          typography: {
            h4: {
              color: '#ffffff',
            },
            body1: {
              color: '#ffffff',
            },
          },
        },
        components: {
          ...baseColors.components,
          ...commonComponents,
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: darkSidenavColor,
                color: darkSidenavTextColor,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: darkSidenavColor,
                color: darkSidenavTextColor,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                '& .MuiListItemIcon-root': {
                  color: darkSidenavTextColor,
                },
                '& .MuiListItemText-root': {
                  color: darkSidenavTextColor,
                },
                '& .MuiDivider-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#1a1d2a',
                color: '#ffffff',
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: '#252836',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.2)',
                },
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              },
              head: {
                color: '#ffffff',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
              },
            },
          },
        },
      });
    }
  };

  // Create themes with custom branding
  const lightTheme = createCustomTheme('light');
  const darkTheme = createCustomTheme('dark');

  // Choose the theme based on darkMode state
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
