import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRole, ...rest }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = user ? true : false;

  // If no user, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" />;
  }

  // If role is required and user doesn't have it, deny access (robust check)
  const userRole = user.role?.trim().toUpperCase();
  const normalizedRequiredRole = requiredRole?.trim().toUpperCase();

  if (normalizedRequiredRole && userRole !== normalizedRequiredRole) {
    return <Navigate to="/HomePage" />;
  }

  return element;
};

export default ProtectedRoute;
