import { Router } from 'express';
import { login, createApiKey, deactivateApiKey } from '../controllers/authController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes (require admin)
router.post('/api-keys', authenticateJWT, requireAdmin, createApiKey);
router.delete('/api-keys/:id', authenticateJWT, requireAdmin, deactivateApiKey);

export default router; 