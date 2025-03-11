import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 🔹 Securely Parse Data from Local Storage
const safeParse = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`🚨 Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// ✅ Define Initial Authentication State
const getInitialAuthState = () => ({
  authToken: sessionStorage.getItem("authToken") || null, // 🔒 Use sessionStorage for security
  user: safeParse("user", {}),
  organization: safeParse("organization", {}),
  authOverride: false,
  isLoading: true, // ✅ Prevents race conditions
});

// 🔹 Define Auth Actions
const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",
  SET_LOADING: "SET_LOADING",
};

// 🔥 Reducer Function for Auth
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload, isLoading: false };

    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case authActionTypes.SET_ORGANIZATION:
      return { ...state, organization: action.payload };

    case authActionTypes.SET_LOADING:
      return { ...state, isLoading: false };

    case authActionTypes.LOGOUT:
      sessionStorage.clear();
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      return { authToken: null, user: {}, organization: {}, isLoading: false };

    default:
      console.warn(`🚨 Unknown action type: ${action.type}`);
      return state;
  }
};

// 🔹 Create Auth Context
const AuthContext = createContext();

// 🔥 AuthProvider Component
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialAuthState);
  const navigate = useNavigate(); // ✅ Ensure React Router is initialized
  const location = useLocation(); // ✅ Get current page URL

  // ✅ Initialize Authentication State on Load
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const user = safeParse("user", {});
    const organization = safeParse("organization", {});

    if (token) {
      dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
      dispatch({ type: authActionTypes.SET_USER, payload: user });
      dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });
    }

    dispatch({ type: authActionTypes.SET_LOADING });
  }, []);

  // ✅ Login Function (Safe Navigation)
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

    // ✅ Redirect after login
    setTimeout(() => {
      if (location.pathname === "/login") {
        navigate("/dashboards/analytics", { replace: true });
      }
    }, 300);
  }, [navigate, location]);

  // ✅ Logout Function (Safe Cleanup)
  const logout = useCallback(() => {
    sessionStorage.clear();
    localStorage.removeItem("user");
    localStorage.removeItem("organization");

    dispatch({ type: authActionTypes.LOGOUT });

    // ✅ Ensure logout redirect happens AFTER state updates
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 300);
  }, [navigate]);

  // ✅ Memoized Context Value
  const authContextValue = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state, login, logout]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// ✅ Hook for Using Auth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("🚨 useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ Exports
export { AuthProvider, useAuth, authActionTypes };
