import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Log from '../models/Log.js';
import { generateErrorFingerprint } from '../utils/fingerprint.js';
import { calculateSeverityScore } from '../utils/severityScore.js';
import sequelize from '../config/database.js';

interface HourlyStats {
  hour: Date;
  count: string;
}

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = { ...req.body };
    
    // Generate fingerprint for error logs
    if (logData.type === 'error' && logData.data?.error) {
      const { message, stack } = logData.data.error;
      logData.fingerprint = generateErrorFingerprint(message, stack);
    }
    
    const log = await Log.create(logData);
    
    // Calculate and update severity score
    const severityScore = await calculateSeverityScore(log);
    await log.update({ severityScore });
    
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ success: false, error: 'Failed to create log' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const {
      type,
      projectId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'severityScore',
      sortOrder = 'DESC'
    } = req.query;

    const where: any = {};
    
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate as string);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate as string);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Log.findAndCountAll({
      where,
      order: [[sortBy as string, sortOrder as 'ASC' | 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
};

export const getGroupedErrors = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: any = {
      type: 'error',
      timestamp: {
        [Op.gte]: oneDayAgo
      }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const groupedErrors = await Log.findAll({
      attributes: [
        'fingerprint',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastOccurrence'],
        [sequelize.fn('MIN', sequelize.col('timestamp')), 'firstOccurrence']
      ],
      where,
      group: ['fingerprint'],
      having: sequelize.literal('fingerprint IS NOT NULL'),
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: groupedErrors
    });
  } catch (error) {
    console.error('Error fetching grouped errors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch grouped errors' });
  }
};

export const getErrorsPerHour = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: any = {
      type: 'error',
      timestamp: {
        [Op.gte]: oneDayAgo
      }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const hourlyStats = await Log.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'hour', sequelize.col('timestamp')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: [sequelize.fn('date_trunc', 'hour', sequelize.col('timestamp'))],
      order: [[sequelize.fn('date_trunc', 'hour', sequelize.col('timestamp')), 'ASC']],
      raw: true
    }) as unknown as HourlyStats[];

    // Format the response
    const formattedStats = hourlyStats.map(stat => ({
      hour: new Date(stat.hour).toISOString(),
      count: Number(stat.count)
    }));

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching hourly error stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hourly error statistics' });
  }
}; 