import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const steps = ['Personal Information', 'Start Test'];

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    institution: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateForm()) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_URL}/test/start`, formData);
        
        toast.success('Test initialized successfully!');
        navigate('/test', { state: { testData: response.data } });
      } catch (error) {
        console.error('Error starting test:', error);
        
        if (error.response?.status === 400) {
          toast.error(error.response.data.error || 'Invalid data provided');
        } else {
          toast.error('Failed to start test. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Participant Registration
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          Please provide your information to begin the cybersecurity aptitude test
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" noValidate autoComplete="off">
            <Alert severity="info" sx={{ mb: 3 }}>
              Your email will be used to identify you and track your progress. 
              Please use an email you have access to.
            </Alert>

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              margin="normal"
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Institution/Organization (Optional)"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              margin="normal"
              disabled={isLoading}
              helperText="e.g., University of Rwanda, Company Name"
            />

            <Alert severity="warning" sx={{ mt: 3, mb: 2 }}>
              <Box component="div">
                <Typography variant="body2" component="strong" display="block" gutterBottom>
                  Important:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  <Typography component="li" variant="body2">
                    Ensure you have stable internet connection
                  </Typography>
                  <Typography component="li" variant="body2">
                    The test must be completed in one sitting
                  </Typography>
                  <Typography component="li" variant="body2">
                    You cannot pause or restart the test
                  </Typography>
                  <Typography component="li" variant="body2">
                    Time starts when you click "Start Test"
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || isLoading}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isLoading}
            sx={{ px: 4 }}
          >
            {isLoading ? 'Starting Test...' : activeStep === steps.length - 1 ? 'Finish' : 'Start Test'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegistrationPage;