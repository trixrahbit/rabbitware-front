import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

const DEV_MODE = false;  // ✅ Toggle to disable auth for development

const ProtectedRoute = ({ children }) => {
  const { authToken, user } = useAuth();

  if (DEV_MODE) {
    return children; // ✅ Skips authentication in development mode
  }

  return authToken && user?.role !== "restricted" ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
