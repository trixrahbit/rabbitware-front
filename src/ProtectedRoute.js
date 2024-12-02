import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext"; // Ensure the path is correct

const ProtectedRoute = ({ children }) => {
  const { authToken, authOverride } = useAuth(); // Directly destructure authToken from the useAuth hook

  console.log('authOverride',authOverride)
  // Check if authToken is truthy. If so, render the children, else redirect to login.
  return authToken || authOverride ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;




