import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext();

const initialAuthState = {
  authToken: sessionStorage.getItem("authToken") || null,
  // Use an empty object if nothing is in session storage.
  user: JSON.parse(sessionStorage.getItem("user") || "{}"),
  isAuthenticated: !!sessionStorage.getItem("authToken"),
};

const authActionTypes = {
  SET_AUTH: "SET_AUTH",
  LOGOUT: "LOGOUT",
};

const isTokenExpired = (token, sessionTimeout) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const sessionLimit = sessionTimeout ? sessionTimeout * 60 * 1000 : 30 * 60 * 1000; // Default: 30 minutes

    return expirationTime < Date.now() - sessionLimit; // ✅ Compare against user's session timeout
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
        user: action.payload.user || {}, // ✅ Ensure user is never null
        isAuthenticated: true,
      };
    case authActionTypes.LOGOUT:
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      return { authToken: null, user: {}, isAuthenticated: false }; // ✅ Set user to {}
    default:
      return state;
  }
};


export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [navigateFunction, setNavigateFunction] = useState(null);

useEffect(() => {
  console.log("🔍 Checking token expiration...");

  if (state.authToken && state.user) {
    const sessionTimeout = state.user.session_timeout || 30; // ✅ Default to 30 minutes
    if (isTokenExpired(state.authToken, sessionTimeout)) {
      console.warn("🚨 Token expired! Logging out...");
      logout();
    }
  }
}, [state.authToken, state.user]);


  const setNavigate = (navigate) => {
    setNavigateFunction(() => navigate);
  };

  // Transform the user object to include a flat organization_id property.
const login = (authToken, user, navigate) => {
  console.log("🔓 Logging in user:", user);
  setNavigate(navigate);

  // Flatten organization ID and store session timeout
  const transformedUser = {
    ...user,
    organization_id: user.organization?.id,
    session_timeout: user.session_timeout || 30, // ✅ Store user's timeout preference
  };

  dispatch({ type: authActionTypes.SET_AUTH, payload: { authToken, user: transformedUser } });
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
