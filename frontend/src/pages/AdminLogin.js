import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Security } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple authentication for demo purposes
    // In production, this would call your backend API
    if (formData.username === 'admin' && formData.password === 'admin123') {
      // Store authentication token (in real app, get from API)
      localStorage.setItem('adminToken', 'admin_temp_token_12345');
      localStorage.setItem('adminUser', JSON.stringify({
        username: formData.username,
        role: 'admin'
      }));
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Admin Login
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary">
            Cybersecurity Aptitude Test Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Demo Credentials:
            <br />
            Username: <strong>admin</strong>
            <br />
            Password: <strong>admin123</strong>
          </Typography>
        </Alert>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isLoading}
            autoFocus
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> This is a restricted area. Unauthorized access is prohibited.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default AdminLogin;