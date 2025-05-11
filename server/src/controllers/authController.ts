import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiKey } from '../models/ApiKey.js';
import { NotFoundError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role = 'user' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    // Проверка на уникальность username
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const user = await User.create({ username, password, role });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    const apiKey = await ApiKey.create({
      projectId,
      key: ApiKey.generateKey(),
      active: true
    });

    res.status(201).json(apiKey);
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deactivateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      throw new NotFoundError('API key not found');
    }

    await apiKey.update({ active: false });
    res.json({ message: 'API key deactivated' });
  } catch (error) {
    console.error('Deactivate API key error:', error);
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};