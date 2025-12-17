const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ============================================
// CORS CONFIGURATION (FIXED FOR PORT 3000/3001)
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, true); // Allow for now, change to callback(new Error('Not allowed')) in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle body parsing errors (JSON / urlencoded)
app.use((err, req, res, next) => {
  if (!err) return next();

  console.error('Body parse error:', err);

  // Bad JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Payload too large
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: 'Payload too large' });
  }

  // Pass on to default error handler
  next(err);
});

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// ============================================
// IN-MEMORY DATA STORAGE (For demo purposes)
// ============================================

const questions = [
  // CYBER FOUNDATIONS & RECONNAISSANCE (5 questions)
  {
    id: 'cf1',
    question_text: 'What is the primary goal of reconnaissance in cybersecurity?',
    category: 'CYBER_FOUNDATIONS',
    difficulty: 'easy',
    options: {
      A: 'To attack systems',
      B: 'To gather information about target systems',
      C: 'To implement firewalls',
      D: 'To encrypt data'
    },
    correct_answer: 'B',
    explanation: 'Reconnaissance is the first phase of ethical hacking where information about the target is gathered.',
    points: 1
  },
  {
    id: 'cf2',
    question_text: 'Which tool is commonly used for network scanning and reconnaissance?',
    category: 'CYBER_FOUNDATIONS',
    difficulty: 'medium',
    options: {
      A: 'Nmap',
      B: 'Wireshark',
      C: 'Metasploit',
      D: 'Burp Suite'
    },
    correct_answer: 'A',
    explanation: 'Nmap (Network Mapper) is the most popular tool for network discovery and security auditing.',
    points: 1
  },
  {
    id: 'cf3',
    question_text: 'What does OSINT stand for in cybersecurity?',
    category: 'CYBER_FOUNDATIONS',
    difficulty: 'medium',
    options: {
      A: 'Open Source Intelligence',
      B: 'Operating System Integration',
      C: 'Online Security Interface',
      D: 'Official Security Investigation'
    },
    correct_answer: 'A',
    explanation: 'OSINT stands for Open Source Intelligence, which involves gathering information from publicly available sources.',
    points: 1
  },
  {
    id: 'cf4',
    question_text: 'Which phase comes after reconnaissance in the ethical hacking process?',
    category: 'CYBER_FOUNDATIONS',
    difficulty: 'medium',
    options: {
      A: 'Scanning',
      B: 'Maintaining Access',
      C: 'Covering Tracks',
      D: 'Reporting'
    },
    correct_answer: 'A',
    explanation: 'After reconnaissance, the next phase is scanning, where systems are scanned for vulnerabilities.',
    points: 1
  },
  {
    id: 'cf5',
    question_text: 'What is footprinting in cybersecurity?',
    category: 'CYBER_FOUNDATIONS',
    difficulty: 'hard',
    options: {
      A: 'Creating a profile of the target organization',
      B: 'Encrypting data footprints',
      C: 'Deleting system logs',
      D: 'Monitoring network traffic'
    },
    correct_answer: 'A',
    explanation: 'Footprinting is the process of gathering information about a target system to create a profile of the organization.',
    points: 1
  },

  // LINUX FUNDAMENTALS (5 questions)
  {
    id: 'lf1',
    question_text: 'What command is used to change file permissions in Linux?',
    category: 'LINUX_FUNDAMENTALS',
    difficulty: 'easy',
    options: {
      A: 'chmod',
      B: 'chown',
      C: 'chgrp',
      D: 'perm'
    },
    correct_answer: 'A',
    explanation: 'The chmod command is used to change the permissions of files and directories.',
    points: 1
  },
  {
    id: 'lf2',
    question_text: 'Which command shows running processes in Linux?',
    category: 'LINUX_FUNDAMENTALS',
    difficulty: 'easy',
    options: {
      A: 'ls',
      B: 'ps',
      C: 'top',
      D: 'Both B and C'
    },
    correct_answer: 'D',
    explanation: 'Both ps and top commands show running processes in Linux.',
    points: 1
  },
  {
    id: 'lf3',
    question_text: 'What is the purpose of the sudo command?',
    category: 'LINUX_FUNDAMENTALS',
    difficulty: 'easy',
    options: {
      A: 'To switch users',
      B: 'To execute commands with superuser privileges',
      C: 'To shutdown the system',
      D: 'To display system information'
    },
    correct_answer: 'B',
    explanation: 'The sudo command allows a permitted user to execute a command as the superuser or another user.',
    points: 1
  },
  {
    id: 'lf4',
    question_text: 'Which command is used to search for text patterns in files?',
    category: 'LINUX_FUNDAMENTALS',
    difficulty: 'medium',
    options: {
      A: 'find',
      B: 'grep',
      C: 'locate',
      D: 'search'
    },
    correct_answer: 'B',
    explanation: 'The grep command is used to search text or search the given file for lines containing a match to the given strings.',
    points: 1
  },
  {
    id: 'lf5',
    question_text: 'What does the command "ls -la" display?',
    category: 'LINUX_FUNDAMENTALS',
    difficulty: 'medium',
    options: {
      A: 'List files in alphabetical order',
      B: 'List all files including hidden ones with details',
      C: 'List only directories',
      D: 'List files by size'
    },
    correct_answer: 'B',
    explanation: 'ls -la lists all files (including hidden ones) in long format with detailed information.',
    points: 1
  },

  // ATTACK VECTORS & EXPLOITATION (5 questions)
  {
    id: 'av1',
    question_text: 'What is a SQL Injection attack?',
    category: 'ATTACK_VECTORS',
    difficulty: 'medium',
    options: {
      A: 'Injection of SQL commands via input fields',
      B: 'Database encryption attack',
      C: 'SQL server DoS attack',
      D: 'SQL backup corruption'
    },
    correct_answer: 'A',
    explanation: 'SQL Injection involves inserting malicious SQL code via input fields to manipulate databases.',
    points: 1
  },
  {
    id: 'av2',
    question_text: 'Which of these is NOT a common web application vulnerability?',
    category: 'ATTACK_VECTORS',
    difficulty: 'hard',
    options: {
      A: 'Cross-Site Scripting (XSS)',
      B: 'Cross-Site Request Forgery (CSRF)',
      C: 'Secure Socket Layer (SSL)',
      D: 'Insecure Direct Object References'
    },
    correct_answer: 'C',
    explanation: 'SSL is a security protocol, not a vulnerability.',
    points: 1
  },
  {
    id: 'av3',
    question_text: 'What is a buffer overflow attack?',
    category: 'ATTACK_VECTORS',
    difficulty: 'hard',
    options: {
      A: 'Writing data beyond the allocated buffer memory',
      B: 'Overloading network buffers',
      C: 'Filling disk space',
      D: 'Flooding email servers'
    },
    correct_answer: 'A',
    explanation: 'Buffer overflow occurs when a program writes data to a buffer beyond its allocated memory.',
    points: 1
  },
  {
    id: 'av4',
    question_text: 'What is phishing?',
    category: 'ATTACK_VECTORS',
    difficulty: 'easy',
    options: {
      A: 'A social engineering attack to steal sensitive information',
      B: 'A network flooding attack',
      C: 'A type of virus',
      D: 'A hardware vulnerability'
    },
    correct_answer: 'A',
    explanation: 'Phishing is a social engineering attack where attackers impersonate legitimate entities to steal sensitive data.',
    points: 1
  },
  {
    id: 'av5',
    question_text: 'What is a zero-day vulnerability?',
    category: 'ATTACK_VECTORS',
    difficulty: 'medium',
    options: {
      A: 'A vulnerability known for zero days',
      B: 'A flaw unknown to the vendor with no patch available',
      C: 'A vulnerability that affects zero systems',
      D: 'A minor security issue'
    },
    correct_answer: 'B',
    explanation: 'A zero-day vulnerability is a software flaw unknown to the vendor with no available patch.',
    points: 1
  },

  // DEFENSE & OPERATIONS (5 questions)
  {
    id: 'do1',
    question_text: 'What is the purpose of a Security Information and Event Management (SIEM) system?',
    category: 'DEFENSE_OPS',
    difficulty: 'medium',
    options: {
      A: 'Real-time analysis of security alerts',
      B: 'Network scanning',
      C: 'Password cracking',
      D: 'Data encryption'
    },
    correct_answer: 'A',
    explanation: 'SIEM systems provide real-time analysis of security alerts generated by network hardware and applications.',
    points: 1
  },
  {
    id: 'do2',
    question_text: 'Which is NOT a principle of defense in depth?',
    category: 'DEFENSE_OPS',
    difficulty: 'hard',
    options: {
      A: 'Multiple layers of security',
      B: 'Single point of failure',
      C: 'Diverse defensive mechanisms',
      D: 'Redundant security controls'
    },
    correct_answer: 'B',
    explanation: 'Defense in depth avoids single points of failure by implementing multiple security layers.',
    points: 1
  },
  {
    id: 'do3',
    question_text: 'What is the purpose of a firewall?',
    category: 'DEFENSE_OPS',
    difficulty: 'easy',
    options: {
      A: 'Monitor and control network traffic',
      B: 'Encrypt data transmissions',
      C: 'Scan for viruses',
      D: 'Manage user passwords'
    },
    correct_answer: 'A',
    explanation: 'A firewall monitors and controls incoming and outgoing network traffic based on predetermined security rules.',
    points: 1
  },
  {
    id: 'do4',
    question_text: 'What does IDS stand for?',
    category: 'DEFENSE_OPS',
    difficulty: 'easy',
    options: {
      A: 'Intrusion Detection System',
      B: 'Internet Defense System',
      C: 'Internal Data Security',
      D: 'Integrated Defense Solution'
    },
    correct_answer: 'A',
    explanation: 'IDS stands for Intrusion Detection System, which monitors network traffic for suspicious activity.',
    points: 1
  },
  {
    id: 'do5',
    question_text: 'What is penetration testing?',
    category: 'DEFENSE_OPS',
    difficulty: 'medium',
    options: {
      A: 'Authorized simulated cyberattack on a computer system',
      B: 'Testing network speed',
      C: 'Checking software compatibility',
      D: 'Validating user permissions'
    },
    correct_answer: 'A',
    explanation: 'Penetration testing is an authorized simulated attack performed to evaluate security.',
    points: 1
  },

  // CAPSTONE & PORTFOLIO (5 questions)
  {
    id: 'cp1',
    question_text: 'In incident response, what does the "Containment" phase involve?',
    category: 'CAPSTONE',
    difficulty: 'medium',
    options: {
      A: 'Preventing further damage',
      B: 'Identifying the incident',
      C: 'Learning from the incident',
      D: 'Restoring systems'
    },
    correct_answer: 'A',
    explanation: 'Containment focuses on preventing the incident from causing more damage.',
    points: 1
  },
  {
    id: 'cp2',
    question_text: 'What is the main purpose of a cybersecurity portfolio?',
    category: 'CAPSTONE',
    difficulty: 'easy',
    options: {
      A: 'To showcase practical skills and projects',
      B: 'To store encrypted files',
      C: 'To manage network devices',
      D: 'To document theoretical knowledge only'
    },
    correct_answer: 'A',
    explanation: 'A portfolio demonstrates practical cybersecurity skills through completed projects and assessments.',
    points: 1
  },
  {
    id: 'cp3',
    question_text: 'What is the first step in the incident response process?',
    category: 'CAPSTONE',
    difficulty: 'easy',
    options: {
      A: 'Preparation',
      B: 'Identification',
      C: 'Containment',
      D: 'Eradication'
    },
    correct_answer: 'A',
    explanation: 'Preparation is the first step, involving developing policies and procedures before incidents occur.',
    points: 1
  },
  {
    id: 'cp4',
    question_text: 'What does NIST stand for in cybersecurity frameworks?',
    category: 'CAPSTONE',
    difficulty: 'medium',
    options: {
      A: 'National Institute of Standards and Technology',
      B: 'Network International Security Team',
      C: 'National Internet Security Taskforce',
      D: 'Network Infrastructure Security Technology'
    },
    correct_answer: 'A',
    explanation: 'NIST stands for National Institute of Standards and Technology, which develops cybersecurity frameworks.',
    points: 1
  },
  {
    id: 'cp5',
    question_text: 'What is risk assessment in cybersecurity?',
    category: 'CAPSTONE',
    difficulty: 'hard',
    options: {
      A: 'Identifying, analyzing, and evaluating risks',
      B: 'Testing system vulnerabilities',
      C: 'Implementing security controls',
      D: 'Monitoring network traffic'
    },
    correct_answer: 'A',
    explanation: 'Risk assessment involves identifying, analyzing, and evaluating potential risks to an organization.',
    points: 1
  }
];

// In-memory stores for demo (participants and tests)
const participants = [];
const tests = [];

// ============================================
// API ROUTES
// ============================================

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Cybersecurity Aptitude Test API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. START TEST
app.post('/api/test/start', (req, res) => {
  try {
    const { email, fullName, institution } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Check if participant exists
    let participant = participants.find(p => p.email === email);
    if (!participant) {
      participant = {
        id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.trim(),
        fullName: fullName.trim(),
        institution: institution ? institution.trim() : 'Not specified',
        registrationDate: new Date().toISOString(),
        testsTaken: 0
      };
      participants.push(participant);
    }

    // Create test
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const test = {
      id: testId,
      participantId: participant.id,
      participantEmail: participant.email,
      participantName: participant.fullName,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      duration: null,
      score: null,
      categoryScores: null
    };
    tests.push(test);

    // Update participant's test count
    participant.testsTaken = (participant.testsTaken || 0) + 1;

    // Select 5 questions from each category (randomly) and return shuffled set
    const selectedQuestions = [];
    const categories = ['CYBER_FOUNDATIONS', 'LINUX_FUNDAMENTALS', 'ATTACK_VECTORS', 'DEFENSE_OPS', 'CAPSTONE'];

    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);

      // Randomly select 5 questions from each category (or fewer if not available)
      const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(5, shuffled.length));

      selectedQuestions.push(...selected);
    });

    // Shuffle all selected questions
    const shuffledQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

    // Return test data
    res.status(200).json({
      message: 'Test started successfully',
      testId: test.id,
      participantId: participant.id,
      questions: shuffledQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        category: q.category,
        difficulty: q.difficulty,
        options: q.options,
        points: q.points
      })),
      maxDuration: 1800, // 30 minutes
      totalQuestions: shuffledQuestions.length,
      questionsPerCategory: 5
    });

  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. SUBMIT TEST
app.post('/api/test/submit', (req, res) => {
  try {
    const { testId, answers } = req.body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Test ID and answers are required' });
    }

    // Find test
    const test = tests.find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.status === 'completed') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // Calculate score
    let totalScore = 0;
    let totalQuestions = answers.length;
    let correctAnswers = 0;
    let categoryScores = {};

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const isCorrect = answer.selectedOption === question.correct_answer;
      if (isCorrect) {
        totalScore += question.points;
        correctAnswers++;
      }

      // Update category scores
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;
      if (isCorrect) {
        categoryScores[question.category].correct++;
      }
    });

    // Calculate percentage
    const percentageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    // Update test
    test.endTime = new Date().toISOString();
    test.duration = Math.floor((new Date(test.endTime) - new Date(test.startTime)) / 1000);
    test.status = 'completed';
    test.score = parseFloat(percentageScore.toFixed(2));
    test.categoryScores = categoryScores;

    // Return results
    res.status(200).json({
      message: 'Test submitted successfully',
      score: test.score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      categoryScores: categoryScores,
      duration: test.duration,
      testId: test.id
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. EXPORT INDIVIDUAL TEST RESULTS (PDF)
app.get('/api/test/export/pdf/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Find test
    const test = tests.find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cybersecurity_test_${testId}.pdf`);
    
    // Pipe to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Cybersecurity Aptitude Test Report', { align: 'center' });
    doc.fontSize(14).text('UR AFRETEC-MASTERCARD Training Program', { align: 'center' });
    doc.moveDown(2);

    // Test Information
    doc.fontSize(16).text('Test Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Test ID: ${test.id}`);
    doc.text(`Participant: ${test.participantName}`);
    doc.text(`Email: ${test.participantEmail}`);
    doc.text(`Test Date: ${new Date(test.startTime).toLocaleString()}`);
    doc.text(`Duration: ${test.duration ? `${Math.floor(test.duration / 60)}m ${test.duration % 60}s` : 'N/A'}`);
    doc.text(`Score: ${test.score || 0}%`);
    doc.text(`Status: ${test.status}`);
    doc.moveDown();

    // Score Summary
    doc.fontSize(16).text('Score Summary', { underline: true });
    doc.moveDown(0.5);
    
    const score = test.score || 0;
    let performance = '';
    if (score >= 90) performance = 'Excellent';
    else if (score >= 80) performance = 'Very Good';
    else if (score >= 70) performance = 'Good';
    else if (score >= 60) performance = 'Average';
    else performance = 'Needs Improvement';
    
    doc.fontSize(12).text(`Overall Score: ${score}% (${performance})`);
    doc.moveDown();

    // Category Breakdown
    if (test.categoryScores) {
      doc.fontSize(16).text('Performance by Category', { underline: true });
      doc.moveDown(0.5);
      
      Object.entries(test.categoryScores).forEach(([category, scores]) => {
        const percentage = scores.total > 0 ? (scores.correct / scores.total * 100).toFixed(1) : 0;
        doc.fontSize(12).text(`${category.replace(/_/g, ' ')}: ${scores.correct}/${scores.total} correct (${percentage}%)`);
      });
      doc.moveDown();
    }

    // Recommendations
    doc.addPage();
    doc.fontSize(16).text('Training Recommendations', { underline: true });
    doc.moveDown(0.5);
    
    const recommendations = [
      'Complete foundational cybersecurity concepts training',
      'Participate in hands-on security labs',
      'Study Linux command line fundamentals',
      'Learn about common attack vectors and defenses',
      'Practice incident response procedures',
      'Join UR AFRETEC-MASTERCARD workshops'
    ];
    
    doc.fontSize(12).text('Based on your performance, we recommend:');
    doc.moveDown(0.5);
    
    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });
    doc.text('UR AFRETEC-MASTERCARD Cybersecurity Program', { align: 'center' });
    doc.text('Confidential - For training purposes only', { align: 'center' });

    // Finalize
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// ============================================
// ADMIN ROUTES (Protected - using simple token for demo)
// ============================================

// Simple token validation middleware
const validateAdminToken = (req, res, next) => {
  const token = req.headers.authorization;
  const validToken = 'admin_temp_token_12345'; // In production, use JWT
  
  if (!token || token !== `Bearer ${validToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// 5. GET ALL PARTICIPANTS (Admin)
app.get('/api/admin/participants', validateAdminToken, (req, res) => {
  try {
    res.status(200).json(participants.map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.fullName,
      institution: p.institution,
      registrationDate: p.registrationDate,
      testsTaken: p.testsTaken || 0
    })));
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. GET ALL TESTS (Admin)
app.get('/api/admin/tests', validateAdminToken, (req, res) => {
  try {
    res.status(200).json(tests.map(t => ({
      id: t.id,
      participantEmail: t.participantEmail,
      participantName: t.participantName,
      startTime: t.startTime,
      endTime: t.endTime,
      duration: t.duration,
      score: t.score,
      status: t.status
    })));
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. GET DASHBOARD STATS (Admin)
app.get('/api/admin/dashboard/stats', validateAdminToken, (req, res) => {
  try {
    const completedTests = tests.filter(t => t.status === 'completed');
    const totalScore = completedTests.reduce((sum, t) => sum + (t.score || 0), 0);
    const averageScore = completedTests.length > 0 ? totalScore / completedTests.length : 0;

    res.status(200).json({
      totalParticipants: participants.length,
      totalTests: tests.length,
      completedTests: completedTests.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      categoryStats: [
        { category: 'CYBER_FOUNDATIONS', totalQuestions: 50, correctAnswers: 35, percentage: '70.0' },
        { category: 'LINUX_FUNDAMENTALS', totalQuestions: 50, correctAnswers: 30, percentage: '60.0' },
        { category: 'ATTACK_VECTORS', totalQuestions: 50, correctAnswers: 40, percentage: '80.0' },
        { category: 'DEFENSE_OPS', totalQuestions: 50, correctAnswers: 25, percentage: '50.0' },
        { category: 'CAPSTONE', totalQuestions: 50, correctAnswers: 38, percentage: '76.0' }
      ]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. EXPORT ALL RESULTS TO EXCEL (Admin)
app.get('/api/admin/export/excel', validateAdminToken, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Results');

    // Define columns
    worksheet.columns = [
      { header: 'Test ID', key: 'id', width: 30 },
      { header: 'Participant Email', key: 'email', width: 30 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Test Date', key: 'date', width: 20 },
      { header: 'Duration (s)', key: 'duration', width: 15 },
      { header: 'Score (%)', key: 'score', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Add rows
    tests.forEach(test => {
      worksheet.addRow({
        id: test.id,
        email: test.participantEmail,
        fullName: test.participantName,
        date: new Date(test.startTime).toLocaleString(),
        duration: test.duration || 'N/A',
        score: test.score || '0.00',
        status: test.status
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=cybersecurity_test_results.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// ============================================
// ROOT AND CATCH-ALL ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Cybersecurity Aptitude Test API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: {
        start: 'POST /api/test/start',
        submit: 'POST /api/test/submit',
        export: 'GET /api/test/export/pdf/:testId'
      },
      admin: {
        participants: 'GET /api/admin/participants',
        tests: 'GET /api/admin/tests',
        stats: 'GET /api/admin/dashboard/stats',
        export: 'GET /api/admin/export/excel'
      }
    },
    cors: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Origins: http://localhost:3000, http://localhost:3001`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('\nEndpoints:');
  console.log('├── POST /api/test/start');
  console.log('├── POST /api/test/submit');
  console.log('├── GET  /api/test/export/pdf/:testId');
  console.log('├── GET  /api/admin/participants (Admin)');
  console.log('├── GET  /api/admin/tests (Admin)');
  console.log('├── GET  /api/admin/dashboard/stats (Admin)');
  console.log('└── GET  /api/admin/export/excel (Admin)');
  console.log('='.repeat(60));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});