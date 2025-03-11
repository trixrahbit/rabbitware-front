import React, { createContext, useContext, useReducer, useEffect, useState } from "react";

const AuthContext = createContext();

const initialAuthState = {
  authToken: sessionStorage.getItem("authToken") || null,
  user: JSON.parse(sessionStorage.getItem("user")) || null,
  authOverride: false,
  isAuthenticated: false,
};

const authActionTypes = {
  SET_AUTH: "SET_AUTH",
  LOGOUT: "LOGOUT",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH:
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

  const setNavigate = (navigate) => {
    setNavigateFunction(() => navigate);
  };

  const login = (authToken, user, navigate) => {
    sessionStorage.setItem("authToken", authToken);
    sessionStorage.setItem("user", JSON.stringify(user));

    setNavigate(navigate);
    dispatch({ type: authActionTypes.SET_AUTH, payload: { authToken, user } });
  };

  const logout = () => {
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
