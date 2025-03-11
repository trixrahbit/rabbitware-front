import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react";

// ✅ Safe Parsing from Local Storage
const safeParse = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`🚨 Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// ✅ Initial State
const initialAuthState = {
  authToken: localStorage.getItem("authToken") || null,
  user: safeParse("user"),
  organization: safeParse("organization"),
  authOverride: false,
  isLoading: true, // 🔥 Ensures app doesn't redirect before loading auth state
};

// ✅ Action Types
const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
};

// ✅ Reducer Function
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload, isLoading: false };
    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case authActionTypes.SET_ORGANIZATION:
      return { ...state, organization: action.payload };
    case authActionTypes.LOGOUT:
      localStorage.clear();
      return { authToken: null, user: null, organization: null, isLoading: false };
    case authActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// ✅ Create Context
const AuthContext = createContext();

// ✅ AuthProvider Component (NO `useNavigate()` here)
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 🔹 Load user data on mount
  useEffect(() => {
    if (state.authToken) {
      dispatch({ type: authActionTypes.SET_USER, payload: safeParse("user") });
      dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: safeParse("organization") });
    }
    dispatch({ type: authActionTypes.SET_LOADING, payload: false });
  }, []);

  // ✅ Login Function (DO NOT use `useNavigate()` here)
  const login = (token, user) => {
    const organization = user.organization;

    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organization", JSON.stringify(organization));

    dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
    dispatch({ type: authActionTypes.SET_USER, payload: user });
    dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });
  };

  // ✅ Logout Function
  const logout = () => {
    localStorage.clear();
    dispatch({ type: authActionTypes.LOGOUT });
  };

  // ✅ Memoized Context Value
  const authContextValue = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// ✅ Custom Hook to Use Auth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("❌ useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
