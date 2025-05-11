import { Request, Response } from 'express';
import { format } from 'fast-csv';
import { Op } from 'sequelize';
import Log from '../models/Log.js';
import { AuthRequest } from '../middleware/auth.js';

interface ExportFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
}

const getFilters = (req: Request): ExportFilters => {
  const { type, startDate, endDate, projectId } = req.query;
  const filters: ExportFilters = {};

  if (type) filters.type = type as string;
  if (projectId) filters.projectId = projectId as string;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  return filters;
};

const buildWhereClause = (filters: ExportFilters) => {
  const where: any = {};

  if (filters.type) where.type = filters.type;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp[Op.gte] = filters.startDate;
    if (filters.endDate) where.timestamp[Op.lte] = filters.endDate;
  }

  return where;
};

export const exportLogs = async (req: AuthRequest, res: Response) => {
  try {
    const exportFormat = req.query.format as string;
    if (!['csv', 'json'].includes(exportFormat)) {
      return res.status(400).json({ error: 'Invalid format. Use csv or json' });
    }

    const filters = getFilters(req);
    const where = buildWhereClause(filters);

    const logs = await Log.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });

    if (exportFormat === 'json') {
      return res.json(logs);
    }

    // CSV export
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    for (const log of logs) {
      csvStream.write({
        id: log.id,
        type: log.type,
        data: JSON.stringify(log.data),
        timestamp: log.timestamp,
        projectId: log.projectId,
        payload: JSON.stringify(log.payload)
      });
    }

    csvStream.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 