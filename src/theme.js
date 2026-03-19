import { createTheme } from '@mui/material/styles';

// Base colors
const colors = {
  background: {
    default: "#f8f9fa",
  },
  text: {
    main: "#495057",
    focus: "#495057",
  },
  transparent: {
    main: "transparent",
  },
  white: {
    main: "#ffffff",
    focus: "#ffffff",
  },
  black: {
    light: "#222323",
    main: "#222323",
    focus: "#222323",
  },
  primary: {
    main: "#268f3b",
    focus: "#268f3b",
  },
  secondary: {
    main: "#0071bb",
    focus: "#0071bb",
  },
  info: {
    main: "#3abff8",
    focus: "#25a8e0",
  },
  success: {
    main: "#36d399",
    focus: "#2bb583",
  },
  warning: {
    main: "#ffb30a",
    focus: "#ffd16c",
  },
  error: {
    main: "#f87272",
    focus: "#f65555",
  },
  light: {
    main: "#f8f9fa",
    focus: "#f8f9fa",
  },
  dark: {
    main: "#2a2d3e",
    focus: "#222432",
  },
  grey: {
    100: "#f8f9fa",
    200: "#f0f2f5",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#6c757d",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },
  gradients: {
    primary: {
      main: "#268f3b",
      state: "#0071bb",
    },
    secondary: {
      main: "#747b8a",
      state: "#495361",
    },
    info: {
      main: "#49a3f1",
      state: "#1A73E8",
    },
    success: {
      main: "#66BB6A",
      state: "#43A047",
    },
    warning: {
      main: "#FFA726",
      state: "#FB8C00",
    },
    error: {
      main: "#EF5350",
      state: "#E53935",
    },
    light: {
      main: "#EBEFF4",
      state: "#CED4DA",
    },
    dark: {
      main: "#42424a",
      state: "#191919",
    },
  },
  badgeColors: {
    primary: {
      background: "#f8b3ca",
      text: "#cc084b",
    },
    secondary: {
      background: "#d7d9e1",
      text: "#6c757d",
    },
    info: {
      background: "#aecef7",
      text: "#095bc6",
    },
    success: {
      background: "#bce2be",
      text: "#339537",
    },
    warning: {
      background: "#ffd59f",
      text: "#c87000",
    },
    error: {
      background: "#fcd3d0",
      text: "#f61200",
    },
    light: {
      background: "#ffffff",
      text: "#c7d3de",
    },
    dark: {
      background: "#8097bf",
      text: "#1e2e4a",
    },
  },
  coloredShadows: {
    primary: "#268f3b",
    secondary: "#110e0e",
    info: "#00bbd4",
    success: "#4caf4f",
    warning: "#ff9900",
    error: "#f44336",
    light: "#adb5bd",
    dark: "#404040",
  },
  inputBorderColor: "#d2d6da",
  tabs: {
    indicator: { boxShadow: "#ddd" },
  },
};

// Typography
const typography = {
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: "1.875rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1.375,
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 700,
    lineHeight: 1.375,
  },
  h5: {
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.375,
  },
  h6: {
    fontSize: "0.875rem",
    fontWeight: 700,
    lineHeight: 1.625,
  },
  subtitle1: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.625,
  },
  subtitle2: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 700,
    lineHeight: 1.5,
    textTransform: "none",
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.25,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.25,
    textTransform: "uppercase",
  },
};

// Borders
const borders = {
  borderRadius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    xxl: "24px",
  },
  borderWidth: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  },
};

// Box shadows
const boxShadows = {
  xs: "0 2px 2px 0 rgba(0,0,0,0.05)",
  sm: "0 4px 4px 0 rgba(0,0,0,0.05)",
  md: "0 8px 8px 0 rgba(0,0,0,0.05)",
  lg: "0 12px 12px 0 rgba(0,0,0,0.05)",
  xl: "0 16px 16px 0 rgba(0,0,0,0.05)",
  xxl: "0 24px 24px 0 rgba(0,0,0,0.05)",
  inset: "inset 0 0 2px 0 rgba(0,0,0,0.05)",
  card: "0 4px 20px 0 rgba(0,0,0,0.05)",
};

// Create theme
const theme = createTheme({
  palette: {
    background: {
      default: colors.background.default,
      paper: colors.white.main,
    },
    primary: {
      main: colors.primary.main,
      focus: colors.primary.focus,
    },
    secondary: {
      main: colors.secondary.main,
      focus: colors.secondary.focus,
    },
    info: {
      main: colors.info.main,
      focus: colors.info.focus,
    },
    success: {
      main: colors.success.main,
      focus: colors.success.focus,
    },
    warning: {
      main: colors.warning.main,
      focus: colors.warning.focus,
    },
    error: {
      main: colors.error.main,
      focus: colors.error.focus,
    },
    text: {
      primary: colors.dark.main,
      secondary: colors.text.main,
      disabled: colors.grey[500],
    },
    divider: colors.grey[300],
    dark: {
      main: colors.dark.main,
      focus: colors.dark.focus,
    },
    light: {
      main: colors.light.main,
      focus: colors.light.focus,
    },
    grey: colors.grey,
  },
  typography,
  borders,
  boxShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: "smooth",
          fontSize: 16,
        },
        body: {
          backgroundColor: colors.background.default,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: borders.borderRadius.md,
          padding: "0.625rem 1.5rem",
          boxShadow: boxShadows.sm,
          "&:hover": {
            boxShadow: boxShadows.md,
          },
        },
        contained: {
          boxShadow: boxShadows.sm,
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          "&:hover": {
            backgroundColor: colors.primary.focus,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary.main,
          "&:hover": {
            backgroundColor: colors.secondary.focus,
          },
        },
        outlined: {
          borderWidth: "1px",
          "&:hover": {
            boxShadow: "none",
          },
        },
        sizeSmall: {
          padding: "0.375rem 1rem",
        },
        sizeLarge: {
          padding: "0.875rem 2rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borders.borderRadius.lg,
          boxShadow: boxShadows.card,
          transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          "&:hover": {
            boxShadow: boxShadows.lg,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "1.5rem",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "1.5rem",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 3,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[300],
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borders.borderRadius.md,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.inputBorderColor,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary.main,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "0.75rem 1rem",
          borderBottom: `1px solid ${colors.grey[300]}`,
        },
        head: {
          color: colors.dark.main,
          fontWeight: 700,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[100],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          padding: "0.75rem 1rem",
        },
      },
    },
  },
});

export default theme;
