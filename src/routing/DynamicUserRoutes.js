// DynamicUserRoutes.js
import React from 'react';
import { useAuth } from 'context/AuthContext'; // Adjust the import path as necessary
import MDAvatar from "components/MDAvatar";
import profilePicture from "assets/images/team-3.jpg";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import Basic from "layouts/authentication/sign-in/basic"; // Ensure this path is correct

const DynamicUserRoutes = () => {
  const { state } = useAuth();
  console.log("Auth State:", state);
  // Safely access the user's name, providing a fallback if not found
  const userName = state.user ? state.user.name : 'Guest';

  return (
    <>
      <div key="user-profile">
        <div>Name: {userName}</div>
      </div>
    </>
  );
};

export default DynamicUserRoutes;
