import { Request, Response } from 'express';
import { AnomalyService } from '../services/anomalyService.js';

const anomalyService = AnomalyService.getInstance();

export const getAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = await anomalyService.getAnomalies();
    return res.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAnomaly = async (req: Request, res: Response) => {
  try {
    const { type, projectId, detectedAt, currentHourCount, average24hCount, threshold } = req.body;
    
    const anomaly = await anomalyService.createAnomaly({
      type,
      projectId,
      detectedAt: new Date(detectedAt),
      currentHourCount,
      average24hCount,
      threshold
    });

    return res.status(201).json(anomaly);
  } catch (error) {
    console.error('Error creating anomaly:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAnomaly = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const anomaly = await anomalyService.updateAnomaly(parseInt(id), updateData);
    return res.json(anomaly);
  } catch (error: any) {
    console.error('Error updating anomaly:', error);
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ error: 'Anomaly not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 