import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Ensures proper routing
import { createBrowserHistory } from "history"; // ✅ Ensure custom history is correctly imported

// ✅ Custom history instance (if used)
const history = createBrowserHistory();

// ✅ Secure Storage Utility
const safeParse = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`🚨 Error parsing ${key} from storage:`, e);
    return defaultValue;
  }
};

// ✅ Lazy Initial State
const getInitialAuthState = () => ({
  authToken: sessionStorage.getItem("authToken") || null, // 🔒 Use sessionStorage for security
  user: safeParse("user", {}),
  organization: safeParse("organization", {}),
  authOverride: false,
  isLoading: true, // ✅ Prevent premature redirects
});

// ✅ Action Types
const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",
  SET_LOADING: "SET_LOADING",
};

// ✅ Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload, isLoading: false };

    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case authActionTypes.SET_ORGANIZATION:
      return { ...state, organization: action.payload };

    case authActionTypes.SET_LOADING: // ✅ NEW: Mark loading as complete
      return { ...state, isLoading: false };

    case authActionTypes.LOGOUT:
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      return { authToken: null, user: {}, organization: {}, isLoading: false };

    default:
      console.warn(`🚨 Unknown action type: ${action.type}`);
      return state;
  }
};

// ✅ Auth Context
const AuthContext = createContext();

// ✅ Auth Provider
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialAuthState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ Ensure auth state is properly loaded before navigating
    const token = sessionStorage.getItem("authToken");
    const user = safeParse("user", {});
    const organization = safeParse("organization", {});

    if (token) {
      dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
      dispatch({ type: authActionTypes.SET_USER, payload: user });
      dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });
    }

    dispatch({ type: authActionTypes.SET_LOADING }); // ✅ Mark loading complete
  }, []);

  // ✅ Secure Login Function
  const login = useCallback((token, user) => {
    if (!token || !user) {
      console.warn("🚨 Missing token or user in login!");
      return;
    }

    const organization = user.organization || {};

    sessionStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organization", JSON.stringify(organization));

    dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
    dispatch({ type: authActionTypes.SET_USER, payload: user });
    dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });

    // ✅ Redirect only if not already on the dashboard
    if (location.pathname !== "/dashboards/analytics") {
      navigate("/dashboards/analytics");
    }
  }, [navigate, location]);

  // ✅ Secure Logout Function
  const logout = useCallback(() => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("organization");

    dispatch({ type: authActionTypes.LOGOUT });

    // ✅ Redirect only if not already on login page
    if (location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location]);

  // ✅ Memoized Context Value for Performance
  const authContextValue = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// ✅ Custom Hook for Using Auth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("🚨 useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ Exports
export { AuthProvider, useAuth, authActionTypes };
