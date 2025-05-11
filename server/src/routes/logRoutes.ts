import { Router } from 'express';
import { createLog, getLogs, getGroupedErrors, getErrorsPerHour } from '../controllers/logController.js';

const router = Router();

router.post('/log', createLog);
router.get('/logs', getLogs);
router.get('/errors/grouped', getGroupedErrors);
router.get('/stats/errors-per-hour', getErrorsPerHour);

export default router; 