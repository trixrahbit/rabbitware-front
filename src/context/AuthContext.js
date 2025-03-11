import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";

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
};

// ✅ Action Types for Reducer
const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",
};

// ✅ Auth Reducer with Immutable Updates
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload };

    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case authActionTypes.SET_ORGANIZATION:
      return { ...state, organization: action.payload };

    case authActionTypes.LOGOUT:
      sessionStorage.removeItem("authToken");  // 🔒 Clear session token
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      return { authToken: null, user: {}, organization: {} };

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

  // ✅ Secure Login Function
  const login = useCallback((token, user) => {
    if (!token || !user) {
      console.warn("🚨 Missing token or user in login!");
      return;
    }

    const organization = user.organization || {};

    sessionStorage.setItem("authToken", token);  // 🔒 Secure storage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organization", JSON.stringify(organization));

    dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
    dispatch({ type: authActionTypes.SET_USER, payload: user });
    dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });
  }, []);

  // ✅ Secure Logout Function
  const logout = useCallback(() => {
    sessionStorage.removeItem("authToken");  // 🔒 Explicitly remove session token
    localStorage.removeItem("user");
    localStorage.removeItem("organization");

    dispatch({ type: authActionTypes.LOGOUT });
  }, []);

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
