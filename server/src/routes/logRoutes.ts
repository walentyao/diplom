import { Router } from 'express';
import {  getGroupedErrors, getErrorsPerHour } from '../controllers/logController.js';
import { exportLogs } from '../controllers/exportController.js';
import { authenticateApiKey, authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public route with API key authentication
router.post('/log', authenticateApiKey, async (req, res) => {
  try {
    // Your existing log creation logic here
    res.status(201).json({ message: 'Log created' });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes (require admin)
router.get('/logs', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    // Your existing logs fetching logic here
    res.json({ logs: [] });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export routes (require admin)
router.get('/logs/export', authenticateJWT, requireAdmin, exportLogs);

router.get('/errors/grouped', getGroupedErrors);
router.get('/stats/errors-per-hour', getErrorsPerHour);

export default router; 