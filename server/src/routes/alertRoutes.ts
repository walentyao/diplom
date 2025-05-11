import { Router } from 'express';
import {
  createAlertRule,
  getAlertRules,
  updateAlertRule,
  deleteAlertRule
} from '../controllers/alertController.js';

const router = Router();

router.post('/rules', createAlertRule);
router.get('/rules', getAlertRules);
router.put('/rules/:id', updateAlertRule);
router.delete('/rules/:id', deleteAlertRule);

export default router; 