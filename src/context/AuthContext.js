import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";

// Safely parse JSON from localStorage
const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return null;
  }
};

const initialAuthState = {
  authToken: localStorage.getItem('authToken') || null,
  user: safeParse('user'),
  parentOrg: safeParse('parentOrg'),
  currentOrg: safeParse('currentOrg'),
};

const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: 'SET_USER',
  SET_PARENT_ORG: 'SET_PARENT_ORG',
  SET_CURRENT_ORG: 'SET_CURRENT_ORG',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload };
    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case authActionTypes.SET_PARENT_ORG:
      return { ...state, parentOrg: action.payload };
    case authActionTypes.SET_CURRENT_ORG:
      return { ...state, currentOrg: action.payload };
    case authActionTypes.LOGOUT:
      localStorage.clear();
      return { authToken: null, user: null, parentOrg: null, currentOrg: null };
    default:
      return state;
  }
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = (token, user) => {
    const parentOrg = user.organization;
    const currentOrg = user.organization;

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('parentOrg', JSON.stringify(parentOrg));
    localStorage.setItem('currentOrg', JSON.stringify(currentOrg));

    dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
    dispatch({ type: authActionTypes.SET_USER, payload: user });
    dispatch({ type: authActionTypes.SET_PARENT_ORG, payload: parentOrg });
    dispatch({ type: authActionTypes.SET_CURRENT_ORG, payload: currentOrg });
  };

  const logout = () => {
    localStorage.clear();
    dispatch({ type: authActionTypes.LOGOUT });
  };

  const authContextValue = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth, authActionTypes };
