
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { CheckCircle, Security, Timer, Assessment } from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/register');
  };

  const topics = [
    'CYBER FOUNDATIONS & RECONNAISSANCE',
    'LINUX FUNDAMENTALS',
    'ATTACK VECTORS & EXPLOITATION',
    'DEFENSE & OPERATIONS',
    'CAPSTONE & PORTFOLIO'
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h3" gutterBottom color="primary">
          Cybersecurity Aptitude Test
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mb: 4, color: 'text.secondary' }}>
          UR AFRETEC-MASTERCARD Yearly Training
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
          Assess your cybersecurity knowledge and aptitude before the training program. 
          This test evaluates fundamental concepts across five key domains with 25 questions 
          (5 questions from each domain) to help tailor the training to participant needs.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Timer sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Time Limit
                </Typography>
                <Typography variant="body2">
                  15-30 minutes depending on your speed. The test automatically submits when time expires.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Multiple Choice
                </Typography>
                <Typography variant="body2">
                  25 questions covering all cybersecurity domains with immediate results.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Security sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Secure & Confidential
                </Typography>
                <Typography variant="body2">
                  Your responses are securely stored and only used for training optimization.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={1} sx={{ p: 3, mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            Topics Covered:
          </Typography>
          <List>
            {topics.map((topic, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={topic} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartTest}
            sx={{ py: 1.5, px: 6, fontSize: '1.1rem' }}
          >
            Start Assessment
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
          Note: You'll need a valid email address to participate. The test must be completed in one session.
        </Typography>
      </Paper>
    </Container>
  );
};

export default LandingPage;