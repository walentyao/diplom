import { Request, Response } from 'express';
import { Event, EventCreationAttributes } from '../models/Event.js';

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { type, name, properties, value, tags, timestamp } = req.body;
    const traceId = req.headers['x-trace-id'] as string;
    const sessionId = req.headers['x-session-id'] as string;

    if (!type || !name || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type !== 'event' && type !== 'metric') {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    if (type === 'metric' && typeof value !== 'number') {
      return res.status(400).json({ error: 'Metric value must be a number' });
    }

    const eventData: EventCreationAttributes = {
      type,
      name,
      properties,
      value,
      tags,
      timestamp: new Date(timestamp),
      traceId,
      sessionId
    };

    const event = await Event.create(eventData);

    return res.status(201).json(event);
  } catch (error) {
    console.error('Error tracking event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { traceId, sessionId, type, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (traceId) where.traceId = traceId;
    if (sessionId) where.sessionId = sessionId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.$gte = new Date(startDate as string);
      if (endDate) where.timestamp.$lte = new Date(endDate as string);
    }

    const events = await Event.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 