const express = require('express');
const router = express.Router();
const TestController = require('../controllers/testController');
const { body } = require('express-validator');

// Validation middleware
const validateStartTest = [
  body('email').isEmail().normalizeEmail(),
  body('fullName').optional().trim().notEmpty(),
  body('institution').optional().trim()
];

const validateSubmitTest = [
  body('testId').isUUID(),
  body('answers').isArray(),
  body('answers.*.questionId').isUUID(),
  body('answers.*.selectedOption').isIn(['A', 'B', 'C', 'D']),
  body('answers.*.timeTaken').isInt({ min: 0 })
];

// Routes
router.post('/start', validateStartTest, TestController.startTest);
router.post('/submit', validateSubmitTest, TestController.submitTest);
router.get('/:testId', TestController.getTestDetails);

module.exports = router;