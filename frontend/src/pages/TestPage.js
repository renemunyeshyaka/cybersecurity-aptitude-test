import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Box,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testData } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeTaken, setTimeTaken] = useState({});
  const [testStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState(''); // ✅ Fixed: Added testId state

  useEffect(() => {
    if (!testData) {
      navigate('/');
      return;
    }

    setQuestions(testData.questions);
    setTestId(testData.testId);
    
    // Initialize time tracking for each question
    const initialTimeTaken = {};
    testData.questions.forEach((q, index) => {
      initialTimeTaken[index] = 0;
    });
    setTimeTaken(initialTimeTaken);

    // Set up interval to track time per question
    const interval = setInterval(() => {
      setTimeTaken(prev => ({
        ...prev,
        [currentQuestion]: prev[currentQuestion] + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [testData, navigate, currentQuestion]);

  const handleAnswerSelect = (questionIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (window.confirm('Are you sure you want to submit the test?')) {
      setIsSubmitting(true);
      
      try {
        // Prepare answers for submission
        const submissionAnswers = questions.map((question, index) => ({
          questionId: question.id,
          selectedOption: answers[index] || null,
          timeTaken: timeTaken[index] || 0
        }));

        const response = await axios.post(`${API_URL}/test/submit`, {
          testId, // ✅ Fixed: Now testId is defined
          answers: submissionAnswers
        });

        toast.success('Test submitted successfully!');
        navigate('/results', { 
          state: { 
            results: response.data,
            testId // ✅ Fixed: Now testId is defined
          } 
        });
      } catch (error) {
        console.error('Error submitting test:', error);
        toast.error('Failed to submit test. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCountdownComplete = () => {
    toast.warning('Time is up! Submitting your test...');
    handleSubmitTest();
  };

  const handleDownloadResults = async () => {
    try {
      // Note: This endpoint needs to be implemented in the backend
      const response = await axios.get(`${API_URL}/test/export/pdf/${testId}`, {
        responseType: 'blob'
      });
      
      // Create blob and download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_test_results_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Results downloaded successfully!');
    } catch (error) {
      console.error('Error downloading results:', error);
      toast.error('Failed to download results. Feature coming soon!');
    }
  };

  const countdownRenderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return <Typography variant="h6" color="error">Time's Up!</Typography>;
    }
    
    const totalSeconds = minutes * 60 + seconds;
    const percentage = (totalSeconds / (testData?.maxDuration || 1800)) * 100;
    
    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </Typography>
          <Typography variant="h6">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={percentage < 20 ? "error" : percentage < 40 ? "warning" : "primary"}
        />
      </Box>
    );
  };

  if (!testData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No test data found. Please start a new test from the homepage.
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Go to Homepage
        </Button>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header with countdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Cybersecurity Aptitude Test
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center">
            UR AFRETEC-MASTERCARD Yearly Training
          </Typography>
          
          <Countdown
            date={testStartTime + (testData.maxDuration * 1000)}
            renderer={countdownRenderer}
            onComplete={handleCountdownComplete}
          />
        </Box>

        {/* Question Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category: {currentQ?.category?.replace('_', ' ') || 'General'}
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {currentQ?.question_text || 'Question not available'}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend">Select your answer:</FormLabel>
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
              >
                {Object.entries(currentQ?.options || {}).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
                    label={`${key}. ${value}`}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: answers[currentQuestion] === key ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "contained" : "outlined"}
                size="small"
                onClick={() => setCurrentQuestion(index)}
                sx={{ minWidth: '40px' }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>

          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Progress: {Object.keys(answers).length} of {questions.length} questions answered
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(Object.keys(answers).length / questions.length) * 100}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* Warning */}
        <Alert severity="warning" sx={{ mt: 3 }}>
          Note: The test will automatically submit when the timer runs out. 
          Ensure you have answered all questions before time expires.
        </Alert>

        {/* Download button for testing (optional) */}
        {testId && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleDownloadResults}
              sx={{ mt: 1 }}
            >
              Download Test Report (Demo)
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TestPage;