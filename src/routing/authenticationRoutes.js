import React from "react";
import Basic from "../layouts/authentication/sign-in/basic";
import Cover from "../layouts/authentication/sign-in/cover";


export const authenticationRoutes = [
  { path: "/login", element: <Basic />, isAuthRoute: true },
  { path: "/register", element: <Cover />, isAuthRoute: true },
  // Add other authentication routes here
];
