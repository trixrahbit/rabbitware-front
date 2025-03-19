import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const initialAuthState = {
  authToken: sessionStorage.getItem("authToken") || null,
  user: JSON.parse(sessionStorage.getItem("user") || "{}"),
  isAuthenticated: !!sessionStorage.getItem("authToken"),
  lastActivity: Date.now(),
};

const authActionTypes = {
  SET_AUTH: "SET_AUTH",
  LOGOUT: "LOGOUT",
  UPDATE_ACTIVITY: "UPDATE_ACTIVITY",
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;

    return decoded.exp * 1000 < Date.now(); // Convert to milliseconds and check
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return true;
  }
};

const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH:
      sessionStorage.setItem("authToken", action.payload.authToken);
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...state,
        authToken: action.payload.authToken,
        user: action.payload.user || {},
        isAuthenticated: true,
        lastActivity: Date.now(),
      };
    case authActionTypes.LOGOUT:
      sessionStorage.clear();
      return { authToken: null, user: {}, isAuthenticated: false, lastActivity: Date.now() };
    case authActionTypes.UPDATE_ACTIVITY:
      return { ...state, lastActivity: Date.now() };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [navigateFunction, setNavigateFunction] = useState(null);

  useEffect(() => {
    if (!state.authToken) return;

    const sessionTimeout = (state.user.session_timeout || 120) * 60 * 1000; // Default: 2 hours
    const now = Date.now();
    const lastActivityElapsed = now - state.lastActivity;

    if (isTokenExpired(state.authToken) || lastActivityElapsed > sessionTimeout) {
      console.warn("🚨 Token expired or session timed out! Logging out...");
      logout();
    }

    // ✅ Only trigger this check at set intervals instead of on every render
    const interval = setInterval(() => {
      if (isTokenExpired(state.authToken) || Date.now() - state.lastActivity > sessionTimeout) {
        console.warn("🚨 Auto logout due to inactivity.");
        logout();
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [state.authToken, state.lastActivity]); // ✅ Only run when token or activity timestamp changes

  // ✅ Track user activity and update state without unnecessary renders
  useEffect(() => {
    const resetActivity = () => dispatch({ type: authActionTypes.UPDATE_ACTIVITY });

    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);
    window.addEventListener("scroll", resetActivity);

    return () => {
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("click", resetActivity);
      window.removeEventListener("scroll", resetActivity);
    };
  }, []);

  const setNavigate = (navigate) => setNavigateFunction(() => navigate);

  const login = (authToken, user, navigate) => {
    console.log("🔓 Logging in user:", user);
    setNavigate(navigate);

    const transformedUser = {
      ...user,
      organization_id: user.organization?.id,
      session_timeout: user.session_timeout || 120, // Default 2 hours
    };

    dispatch({ type: authActionTypes.SET_AUTH, payload: { authToken, user: transformedUser } });
  };

  const logout = () => {
    console.log("🔐 Logging out...");
    sessionStorage.clear();
    dispatch({ type: authActionTypes.LOGOUT });
    if (navigateFunction) navigateFunction("/login", { replace: true });
  };

  return <AuthContext.Provider value={{ ...state, login, logout, setNavigate }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
