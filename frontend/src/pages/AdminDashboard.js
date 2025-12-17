import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Download,
  MoreVert,
  People,
  Assessment,
  Score,
  TrendingUp,
  Logout,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For demo purposes - use mock data
      const mockStats = {
        totalParticipants: 15,
        totalTests: 28,
        completedTests: 25,
        averageScore: 72.5,
        categoryStats: [
          { category: 'CYBER_FOUNDATIONS', totalQuestions: 50, correctAnswers: 35, percentage: '70.0' },
          { category: 'LINUX_FUNDAMENTALS', totalQuestions: 50, correctAnswers: 30, percentage: '60.0' },
          { category: 'ATTACK_VECTORS', totalQuestions: 50, correctAnswers: 40, percentage: '80.0' },
          { category: 'DEFENSE_OPS', totalQuestions: 50, correctAnswers: 25, percentage: '50.0' },
          { category: 'CAPSTONE', totalQuestions: 50, correctAnswers: 38, percentage: '76.0' }
        ]
      };

      const mockParticipants = [
        { id: 1, email: 'student1@ur.ac.rw', full_name: 'Alice Mugisha', institution: 'University of Rwanda', registration_date: '2024-01-15', last_test_date: '2024-02-01', total_tests_taken: 2 },
        { id: 2, email: 'student2@ur.ac.rw', full_name: 'Bob Gasana', institution: 'University of Rwanda', registration_date: '2024-01-16', last_test_date: '2024-02-02', total_tests_taken: 1 },
        { id: 3, email: 'professional@company.com', full_name: 'Charlie Niyomugabo', institution: 'Tech Solutions Ltd', registration_date: '2024-01-20', last_test_date: '2024-02-03', total_tests_taken: 1 },
      ];

      const mockTests = [
        { id: 'test-001', email: 'student1@ur.ac.rw', full_name: 'Alice Mugisha', start_time: '2024-02-01T10:30:00', duration: 956, score: 85.5, status: 'completed' },
        { id: 'test-002', email: 'student2@ur.ac.rw', full_name: 'Bob Gasana', start_time: '2024-02-02T14:20:00', duration: 1023, score: 72.0, status: 'completed' },
        { id: 'test-003', email: 'professional@company.com', full_name: 'Charlie Niyomugabo', start_time: '2024-02-03T09:15:00', duration: 845, score: 91.0, status: 'completed' },
        { id: 'test-004', email: 'student1@ur.ac.rw', full_name: 'Alice Mugisha', start_time: '2024-02-10T11:45:00', duration: null, score: null, status: 'in_progress' },
      ];

      setStats(mockStats);
      setParticipants(mockParticipants);
      setTests(mockTests);

      // Uncomment this when your backend is ready:
      /*
      const token = localStorage.getItem('adminToken');
      
      const statsResponse = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data);

      const participantsResponse = await axios.get(`${API_URL}/admin/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipants(participantsResponse.data);

      const testsResponse = await axios.get(`${API_URL}/admin/tests`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setTests(testsResponse.data);
      */
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleExportExcel = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    // Create a hidden link element
    const response = await fetch(`${API_URL}/admin/export/excel`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cybersecurity_results_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Excel file downloaded successfully!');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export data. Please try again.');
  }
};

const handleExportPDF = async (testId) => {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/admin/export/pdf/${testId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('PDF generation failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test_report_${testId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('PDF report downloaded successfully!');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    toast.error('Failed to generate PDF. Please try again.');
  }
};

const handleExportParticipants = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/admin/export/participants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Participants list downloaded successfully!');
  } catch (error) {
    console.error('Error exporting participants:', error);
    toast.error('Failed to export participants. Please try again.');
  }
};


<Button
  variant="outlined"
  startIcon={<Download />}
  onClick={handleExportParticipants}
  sx={{ mr: 1 }}
>
  Export Participants
</Button>

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchDashboardData();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: ''
    });
    fetchDashboardData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Cybersecurity Aptitude Test Management - UR AFRETEC-MASTERCARD
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); fetchDashboardData(); }}>
                <Refresh sx={{ mr: 1 }} /> Refresh
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.totalParticipants || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Participants</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.totalTests || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Tests</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Score sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.completedTests || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed Tests</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.averageScore?.toFixed(1) || '0.0'}%</Typography>
                  <Typography variant="body2" color="text.secondary">Average Score</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Performance by Category
        </Typography>
        <Grid container spacing={2}>
          {stats?.categoryStats?.map((categoryStat) => {
            const percentage = parseFloat(categoryStat.percentage);
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={categoryStat.category}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {categoryStat.category.replace('_', ' ')}
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {percentage}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage}
                      color={
                        percentage >= 80 ? 'success' : 
                        percentage >= 60 ? 'primary' : 
                        'warning'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {categoryStat.correctAnswers}/{categoryStat.totalQuestions} correct
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Tests Table */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Tests ({tests.length})
        </Typography>
        
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Participant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id} hover>
                  <TableCell>{test.full_name || 'N/A'}</TableCell>
                  <TableCell>{test.email}</TableCell>
                  <TableCell>{formatDate(test.start_time)}</TableCell>
                  <TableCell>
                    {test.duration ? `${Math.floor(test.duration / 60)}m ${test.duration % 60}s` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {test.score !== null ? (
                      <Chip 
                        label={`${parseFloat(test.score).toFixed(1)}%`}
                        color={test.score >= 80 ? 'success' : test.score >= 60 ? 'primary' : 'warning'}
                        size="small"
                      />
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={test.status || 'unknown'}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleExportPDF(test.id)}
                      disabled={test.status !== 'completed'}
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Participants Table */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Participants ({participants.length})
        </Typography>
        
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Last Test</TableCell>
                <TableCell>Tests Taken</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id} hover>
                  <TableCell>{participant.full_name || 'N/A'}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.institution || 'N/A'}</TableCell>
                  <TableCell>{formatDate(participant.registration_date)}</TableCell>
                  <TableCell>{formatDate(participant.last_test_date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={participant.total_tests_taken || 0}
                      color={participant.total_tests_taken > 0 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;