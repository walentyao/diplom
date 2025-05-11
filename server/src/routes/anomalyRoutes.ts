import { Router } from 'express';
import { AnomalyService } from '../services/anomalyService.js';

const router = Router();
const anomalyService = AnomalyService.getInstance();

// Маршрут для получения аномалий
router.get('/', async (req, res) => {
  try {
    const anomalies = await anomalyService.getAnomalies();
    res.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

export default router;