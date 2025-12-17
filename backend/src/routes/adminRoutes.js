const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Middleware for admin authentication (simplified - implement proper auth)
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Routes
router.get('/participants', authenticateAdmin, AdminController.getAllParticipants);
router.get('/tests', authenticateAdmin, AdminController.getAllTests);
router.get('/export/excel', authenticateAdmin, AdminController.exportToExcel);
router.get('/export/pdf/:testId', authenticateAdmin, AdminController.exportToPDF);
router.get('/dashboard/stats', authenticateAdmin, AdminController.getDashboardStats);

module.exports = router;