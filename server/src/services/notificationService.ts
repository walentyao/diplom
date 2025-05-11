import nodemailer from 'nodemailer';
import AlertRule from '../models/AlertRule.js';

interface NotificationPayload {
  rule: AlertRule;
  count: number;
  timestamp: Date;
  details?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (payload.rule.notifyType === 'webhook') {
        await this.sendWebhookNotification(payload);
      } else if (payload.rule.notifyType === 'email') {
        await this.sendEmailNotification(payload);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  private async sendWebhookNotification(payload: NotificationPayload): Promise<void> {
    try {
      const response = await fetch(payload.rule.notifyTarget, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule: {
            id: payload.rule.id,
            type: payload.rule.type,
            level: payload.rule.level,
            projectId: payload.rule.projectId,
          },
          count: payload.count,
          timestamp: payload.timestamp,
          details: payload.details,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      console.log(`Webhook notification sent successfully to ${payload.rule.notifyTarget}`);
    } catch (error) {
      console.error('Webhook notification failed:', error);
      throw error;
    }
  }

  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: payload.rule.notifyTarget,
        subject: `Alert: ${payload.rule.type} threshold exceeded`,
        html: `
          <h2>Alert Notification</h2>
          <p><strong>Rule ID:</strong> ${payload.rule.id}</p>
          <p><strong>Type:</strong> ${payload.rule.type}</p>
          <p><strong>Level:</strong> ${payload.rule.level || 'N/A'}</p>
          <p><strong>Project ID:</strong> ${payload.rule.projectId}</p>
          <p><strong>Count:</strong> ${payload.count}</p>
          <p><strong>Threshold:</strong> ${payload.rule.threshold}</p>
          <p><strong>Interval:</strong> ${payload.rule.intervalMinutes} minutes</p>
          <p><strong>Timestamp:</strong> ${payload.timestamp.toISOString()}</p>
          ${payload.details ? `<p><strong>Details:</strong> ${JSON.stringify(payload.details, null, 2)}</p>` : ''}
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email notification sent successfully to ${payload.rule.notifyTarget}`);
    } catch (error) {
      console.error('Email notification failed:', error);
      throw error;
    }
  }
}

export default NotificationService; 