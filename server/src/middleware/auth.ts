import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiKey } from '../models/ApiKey';
import { NotFoundError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: User;
  projectId?: string;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const authenticateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(401).json({ error: 'No API key provided' });
    }

    const key = await ApiKey.findOne({
      where: {
        key: apiKey,
        active: true
      }
    });

    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.projectId = key.projectId;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 