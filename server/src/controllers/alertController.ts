import { Request, Response } from 'express';
import AlertRule from '../models/AlertRule.js';

export const createAlertRule = async (req: Request, res: Response) => {
  try {
    const rule = await AlertRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    res.status(500).json({ success: false, error: 'Failed to create alert rule' });
  }
};

export const getAlertRules = async (_: Request, res: Response) => {
  try {
    const rules = await AlertRule.findAll();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alert rules' });
  }
};

export const updateAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = await AlertRule.findByPk(id);
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Alert rule not found' });
    }

    await rule.update(req.body);
    return res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating alert rule:', error);
    return res.status(500).json({ success: false, error: 'Failed to update alert rule' });
  }
};

export const deleteAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = await AlertRule.findByPk(id);
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Alert rule not found' });
    }

    await rule.destroy();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete alert rule' });
  }
}; 