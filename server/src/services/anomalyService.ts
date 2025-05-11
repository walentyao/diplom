import { Anomaly, AnomalyAttributes } from '../models/Anomaly.js';
import { Error } from '../models/Error.js';
import { logger } from '../utils/logger.js';
import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';

export class AnomalyService {
  private static instance: AnomalyService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): AnomalyService {
    if (!AnomalyService.instance) {
      AnomalyService.instance = new AnomalyService();
    }
    return AnomalyService.instance;
  }

  public async createAnomaly(data: Omit<AnomalyAttributes, 'id'>): Promise<AnomalyAttributes> {
    const anomaly = await Anomaly.create(data);
    return anomaly.toJSON();
  }

  public async updateAnomaly(id: number, data: Partial<Omit<AnomalyAttributes, 'id'>>): Promise<AnomalyAttributes> {
    const anomaly = await Anomaly.findByPk(id);
    if (!anomaly) {
      throw new NotFoundError('Anomaly not found');
    }
    await anomaly.update(data);
    return anomaly.toJSON();
  }

  public async startPeriodicCheck(): Promise<void> {
    if (this.checkInterval) {
      return;
    }

    // Run immediately on start
    await this.checkForAnomalies();

    // Then run every 10 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkForAnomalies();
    }, 10 * 60 * 1000);
  }

  public stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkForAnomalies(): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get current hour error count
      const currentHourCount = await Error.count({
        where: {
          timestamp: {
            [Op.gte]: oneHourAgo
          }
        }
      });

      // Get errors for the last 24 hours
      const last24HoursErrors = await Error.findAll({
        where: {
          timestamp: {
            [Op.gte]: twentyFourHoursAgo
          }
        }
      });

      // Calculate hourly counts
      const hourlyCounts = new Array(24).fill(0);
      last24HoursErrors.forEach(error => {
        const hourIndex = Math.floor((now.getTime() - error.timestamp.getTime()) / (60 * 60 * 1000));
        if (hourIndex < 24) {
          hourlyCounts[hourIndex]++;
        }
      });

      // Calculate average excluding current hour
      const average24hCount = hourlyCounts.slice(1).reduce((sum, count) => sum + count, 0) / 23;

      // Check if current hour is 3 times higher than average
      if (currentHourCount > average24hCount * 3) {
        const anomalyData: AnomalyAttributes = {
          type: 'ERROR_SPIKE',
          projectId: 'default',
          detectedAt: now,
          currentHourCount,
          average24hCount,
          threshold: average24hCount * 3
        };

        await Anomaly.create(anomalyData);
        logger.info('Anomaly detected:', {
          type: anomalyData.type,
          currentHourCount,
          average24hCount,
          threshold: anomalyData.threshold
        });
      }
    } catch (error) {
      logger.error('Error checking for anomalies:', error);
    }
  }

  public async getAnomalies(): Promise<AnomalyAttributes[]> {
    const anomalies = await Anomaly.findAll({
      order: [['detectedAt', 'DESC']]
    });
    return anomalies.map(anomaly => anomaly.toJSON());
  }
} 