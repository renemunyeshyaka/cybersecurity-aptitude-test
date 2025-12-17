import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    // In a real app, you would verify the token with your backend
    // For demo purposes, we'll just check if it exists
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;