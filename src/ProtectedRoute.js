import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authToken, user } = useAuth();
  return authToken && user?.role !== "restricted" ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
