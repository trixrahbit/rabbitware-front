import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

const initialAuthState = {
  authToken: sessionStorage.getItem("authToken") || null,
  user: JSON.parse(sessionStorage.getItem("user") || "{}"), // ✅ Prevent JSON.parse(null) error
  isAuthenticated: !!sessionStorage.getItem("authToken"),
};

const authActionTypes = {
  SET_AUTH: "SET_AUTH",
  LOGOUT: "LOGOUT",
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false; // No expiration, assume valid
    return decoded.exp * 1000 < Date.now(); // Exp is in seconds, JS uses ms
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return true; // If decoding fails, assume it's invalid
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
        user: action.payload.user,
        isAuthenticated: true,
      };
    case authActionTypes.LOGOUT:
      sessionStorage.clear();
      return { authToken: null, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [navigateFunction, setNavigateFunction] = useState(null);

  useEffect(() => {
    console.log("🔍 Auth Token:", state.authToken);
    console.log("🔍 User Data:", state.user);
    console.log("🔍 Organization ID:", state.user?.organization_id);

    if (state.authToken && isTokenExpired(state.authToken)) {
      console.warn("🚨 Token expired! Logging out...");
      logout();
    }
  }, [state.authToken]);

  const setNavigate = (navigate) => {
    setNavigateFunction(() => navigate);
  };

  const login = (authToken, user, navigate) => {
    console.log("🔓 Logging in user:", user);
    setNavigate(navigate);
    dispatch({ type: authActionTypes.SET_AUTH, payload: { authToken, user } });
  };

  const logout = () => {
    console.log("🔐 Logging out...");
    sessionStorage.clear();
    dispatch({ type: authActionTypes.LOGOUT });
    if (navigateFunction) {
      navigateFunction("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setNavigate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
