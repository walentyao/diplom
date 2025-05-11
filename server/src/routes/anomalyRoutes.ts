import { Router } from 'express';
import { AnomalyService } from '../services/anomalyService';

const router = Router();
const anomalyService = AnomalyService.getInstance();

// Start periodic anomaly checks when the server starts
anomalyService.startPeriodicCheck().catch(error => {
  console.error('Failed to start anomaly checks:', error);
});

router.get('/anomalies', async (req, res) => {
  try {
    const anomalies = await anomalyService.getAnomalies();
    res.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

export default router; 