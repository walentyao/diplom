import { Router } from 'express';
import { login, register, createApiKey, deactivateApiKey } from '../controllers/authController.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require admin)
router.post('/api-keys', authenticateJWT, requireAdmin, createApiKey);
router.delete('/api-keys/:id', authenticateJWT, requireAdmin, deactivateApiKey);

export default router;