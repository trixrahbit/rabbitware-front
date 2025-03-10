import React, { createContext, useContext, useReducer, useMemo } from "react";

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

// ✅ Updated to include organization_id
const initialAuthState = {
  authToken: localStorage.getItem("authToken") || null,
  user: safeParse("user"),
  organization: safeParse("organization"),  // ✅ Store org details
  authOverride: false,
};

const authActionTypes = {
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_ORGANIZATION: "SET_ORGANIZATION",  // ✅ New action type
};

const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.SET_AUTH_TOKEN:
      return { ...state, authToken: action.payload };
    case authActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case authActionTypes.SET_ORGANIZATION:  // ✅ Handle org
      return { ...state, organization: action.payload };
    case authActionTypes.LOGOUT:
      localStorage.clear();
      return { authToken: null, user: null, organization: null };
    default:
      return state;
  }
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = (token, user) => {
    const organization = user.organization;  // ✅ Set the user's org

    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organization", JSON.stringify(organization));  // ✅ Store organization

    dispatch({ type: authActionTypes.SET_AUTH_TOKEN, payload: token });
    dispatch({ type: authActionTypes.SET_USER, payload: user });
    dispatch({ type: authActionTypes.SET_ORGANIZATION, payload: organization });  // ✅ Update organization
  };

  const logout = () => {
    localStorage.clear();
    dispatch({ type: authActionTypes.LOGOUT });
  };

  const authContextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state]
  );

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
