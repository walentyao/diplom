import { Router } from 'express';
import { trackEvent, getEvents } from '../controllers/eventController.js';

const router = Router();

router.post('/track', trackEvent);
router.get('/', getEvents);

export default router; 