import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for redirecting

// 🚀 Secure Storage Utility
const safeParse = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`🚨 Error parsing ${key} from storage:`, e);
    return defaultValue;
  }
};

// ✅ Initial State with Default Values
const initialAuthState = {
  authToken: sessionStorage.getItem("authToken") || null,  // 🔒 Use sessionStorage for security
  user: safeParse("user", {}),
  organization: safeParse("organization", {}),
  authOverride: false,
  isLoading: true,  // ✅ NEW: Ensure state is fully initialized before rendering
};

// ✅ Action Types for Reducer
const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",
  SET_LOADING: "SET_LOADING", // ✅ NEW
};

// ✅ Auth Reducer with Immutable Updates
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload, isLoading: false };

    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case authActionTypes.SET_ORGANIZATION:
      return { ...state, organization: action.payload };

    case authActionTypes.SET_LOADING:  // ✅ NEW: Mark loading as complete
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
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const navigate = useNavigate(); // ✅ Redirect on login/logout

  useEffect(() => {
    // ✅ Ensure auth state is properly loaded
    const token = sessionStorage.getItem("authToken");
    const user = safeParse("user", {});
    const organization = safeParse("organization", {});

    if (token) {
      dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
      dispatch({ type: authActionTypes.SET_USER, payload: user });
      dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });
    } else {
      dispatch({ type: authActionTypes.SET_LOADING });
    }
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

    navigate("/dashboards/analytics"); // ✅ Redirect to dashboard after login
  }, [navigate]);

  // ✅ Secure Logout Function
  const logout = useCallback(() => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("organization");

    dispatch({ type: authActionTypes.LOGOUT });

    navigate("/login"); // ✅ Redirect to login page
  }, [navigate]);

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
