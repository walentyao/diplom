import { Op } from 'sequelize';
import AlertRule from '../models/AlertRule.js';
import Log from '../models/Log.js';
import NotificationService from './notificationService.js';

type AlertCallback = (rule: AlertRule, count: number) => void;

class AlertService {
  private static instance: AlertService;
  private callbacks: AlertCallback[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  public addCallback(callback: AlertCallback): void {
    this.callbacks.push(callback);
  }

  public async startChecking(): Promise<void> {
    if (this.checkInterval) {
      return;
    }

    const interval = parseInt(process.env.ALERT_CHECK_INTERVAL || '60000');
    this.checkInterval = setInterval(() => this.checkAlerts(), interval);
  }

  public stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkAlerts(): Promise<void> {
    try {
      const activeRules = await AlertRule.findAll({
        where: { isActive: true }
      });

      for (const rule of activeRules) {
        await this.checkRule(rule);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  private async checkRule(rule: AlertRule): Promise<void> {
    try {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - rule.intervalMinutes);

      const where: any = {
        type: rule.type,
        timestamp: {
          [Op.gte]: startTime
        }
      };

      if (rule.level) {
        where.level = rule.level;
      }

      if (rule.projectId) {
        where.projectId = rule.projectId;
      }

      const count = await Log.count({ where });

      if (count >= rule.threshold) {
        // Update last checked time
        await rule.update({ lastChecked: new Date() });

        // Notify all callbacks
        for (const callback of this.callbacks) {
          try {
            callback(rule, count);
          } catch (error) {
            console.error('Error in alert callback:', error);
          }
        }

        // Send notification
        try {
          await this.notificationService.sendNotification({
            rule,
            count,
            timestamp: new Date(),
            details: {
              interval: rule.intervalMinutes,
              threshold: rule.threshold,
              actualCount: count
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    } catch (error) {
      console.error(`Error checking rule ${rule.id}:`, error);
    }
  }
}

export default AlertService; 