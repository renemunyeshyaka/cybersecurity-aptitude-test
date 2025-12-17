import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { CheckCircle, Home, Assessment, Download } from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.results) {
      const resultsData = location.state.results;
      // Ensure score is a number
      if (resultsData.score !== undefined) {
        resultsData.score = parseFloat(resultsData.score) || 0;
      }
      setResults(resultsData);
      setTestId(location.state.testId || '');
    } else {
      // If no results in state, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const handleDownloadPDF = async () => {
    try {
      if (!testId) {
        toast.error('No test ID available for download');
        return;
      }

      setLoading(true);
      toast.info('Generating PDF report...');
      
      const response = await fetch(`${API_URL}/test/export/pdf/${testId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cybersecurity_test_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!results) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading results...</Typography>
      </Container>
    );
  }

  // Safely get the score as a number
  const score = typeof results.score === 'number' ? results.score : parseFloat(results.score) || 0;
  const totalQuestions = results.totalQuestions || 0;
  const correctAnswers = results.correctAnswers || 0;
  const duration = results.duration || 0;
  const categoryScores = results.categoryScores || {};

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return 'success';
    if (scoreValue >= 60) return 'warning';
    return 'error';
  };

  const getPerformanceText = (scoreValue) => {
    if (scoreValue >= 80) return 'Excellent';
    if (scoreValue >= 70) return 'Good';
    if (scoreValue >= 60) return 'Average';
    if (scoreValue >= 50) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Assessment sx={{ fontSize: 60, color: getScoreColor(score), mb: 2 }} />
          
          <Typography variant="h3" gutterBottom>
            Test Results
          </Typography>
          
          <Typography variant="h6" gutterBottom color="text.secondary">
            Cybersecurity Aptitude Assessment - UR AFRETEC-MASTERCARD
          </Typography>
        </Box>

        {/* Overall Score */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color={getScoreColor(score)}>
                    {score.toFixed(1)}%
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Overall Score
                  </Typography>
                  <Chip 
                    label={getPerformanceText(score)} 
                    color={getScoreColor(score)}
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Test Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Correct Answers
                    </Typography>
                    <Typography variant="h5">
                      {correctAnswers} / {totalQuestions}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="h5">
                      {Math.floor(duration / 60)}m {duration % 60}s
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={score} 
                    color={getScoreColor(score)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {Object.keys(categoryScores).length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance by Category
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Correct</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(categoryScores).map(([category, data]) => {
                      // Safely calculate percentage
                      const correct = data.correct || 0;
                      const total = data.total || 1;
                      const percentage = total > 0 ? (correct / total * 100) : 0;
                      
                      return (
                        <TableRow key={category}>
                          <TableCell>
                            <Typography variant="body2">
                              {category.replace(/_/g, ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {correct > 0 && <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />}
                              {correct}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{total}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${percentage.toFixed(1)}%`}
                              size="small"
                              color={getScoreColor(percentage)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ width: 100, display: 'inline-block' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={percentage} 
                                color={getScoreColor(percentage)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Return to Home
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
            disabled={loading || !testId}
            sx={{ mb: 2 }}
          >
            {loading ? 'Generating PDF...' : 'Download Results (PDF)'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          Thank you for completing the Cybersecurity Aptitude Test. 
          Your results will help tailor the UR AFRETEC-MASTERCARD training program to your needs.
          {testId && ` Your Test ID is: ${testId}`}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ResultsPage;