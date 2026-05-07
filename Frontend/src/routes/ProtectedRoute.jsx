// eslint-disable react/prop-types

import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Assuming this is installed

const ProtectedRoute = ({ children, allowedRoles, requireCrisisClearance = false }) => {
  const { token, role, user } = useContext(authContext);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Validate JWT expiration
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        setIsTokenValid(decodedToken.exp > currentTime);
      } catch (error) {
        console.error('Invalid token:', error);
        setIsTokenValid(false);
      }
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  // Normalize role to lowercase
  const normalizedRole = role?.toLowerCase();
  const isAdmin = normalizedRole === 'admin';
  
  // Admin gets access to everything
  const effectiveAllowedRoles = isAdmin 
    ? ['admin', 'doctor', 'paciente', 'patient']  // Supporting both spellings
    : allowedRoles;

  // Check if user's role is allowed
  const isAllowed = effectiveAllowedRoles.some(allowedRole => 
    normalizedRole === allowedRole.toLowerCase()
  );

  // Check for crisis clearance if required
  const hasCrisisClearance = !requireCrisisClearance; // Simplified for now

  // Determine access
  let accessibleRoute = children;
  if (!token || !isTokenValid || !isAllowed || !hasCrisisClearance) {
    // Redirect to login if not authenticated
    accessibleRoute = <Navigate to="/login" replace={true} />;
  }

  return accessibleRoute;
};

export default ProtectedRoute;