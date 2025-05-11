import nodemailer from 'nodemailer';
import AlertRule from '../models/AlertRule.js';
import axios from 'axios';

interface NotificationPayload {
  rule: AlertRule;
  count: number;
  timestamp: Date;
  details?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private transporter: nodemailer.Transporter;
  private readonly telegramBotToken: string;

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
    
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!this.telegramBotToken) {
      console.warn('TELEGRAM_BOT_TOKEN environment variable not set. Telegram notifications will not work.');
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      switch (payload.rule.notifyType) {
        case 'webhook':
          await this.sendWebhookNotification(payload);
          break;
        case 'email':
          await this.sendEmailNotification(payload);
          break;
        case 'slack':
          await this.sendSlackNotification(payload);
          break;
        case 'telegram':
          await this.sendTelegramNotification(payload);
          break;
        default:
          throw new Error(`Unsupported notification type: ${payload.rule.notifyType}`);
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

  private async sendSlackNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Slack webhook URL should be provided in the notifyTarget
      const webhookUrl = payload.rule.notifyTarget;
      
      // Format according to Slack's webhook API
      const response = await axios.post(webhookUrl, {
        text: `Alert: ${payload.rule.type} threshold exceeded`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚨 Alert Notification",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Rule ID:* ${payload.rule.id}`
              },
              {
                type: "mrkdwn",
                text: `*Type:* ${payload.rule.type}`
              },
              {
                type: "mrkdwn",
                text: `*Level:* ${payload.rule.level || 'N/A'}`
              },
              {
                type: "mrkdwn",
                text: `*Project ID:* ${payload.rule.projectId}`
              },
              {
                type: "mrkdwn",
                text: `*Count:* ${payload.count}`
              },
              {
                type: "mrkdwn",
                text: `*Threshold:* ${payload.rule.threshold}`
              },
              {
                type: "mrkdwn",
                text: `*Interval:* ${payload.rule.intervalMinutes} minutes`
              },
              {
                type: "mrkdwn",
                text: `*Timestamp:* ${payload.timestamp.toISOString()}`
              }
            ]
          }
        ]
      });

      if (response.status !== 200) {
        throw new Error(`Slack notification failed with status ${response.status}`);
      }
      
      console.log(`Slack notification sent successfully to ${payload.rule.notifyTarget}`);
    } catch (error) {
      console.error('Slack notification failed:', error);
      throw error;
    }
  }

  private async sendTelegramNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (!this.telegramBotToken) {
        throw new Error('TELEGRAM_BOT_TOKEN not configured');
      }

      // Chat ID should be provided in the notifyTarget
      const chatId = payload.rule.notifyTarget;
      const apiUrl = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      
      // Format message for Telegram
      const message = `
🚨 *ALERT NOTIFICATION*
*Rule ID:* ${payload.rule.id}
*Type:* ${payload.rule.type}
*Level:* ${payload.rule.level || 'N/A'}
*Project ID:* ${payload.rule.projectId}
*Count:* ${payload.count}
*Threshold:* ${payload.rule.threshold}
*Interval:* ${payload.rule.intervalMinutes} minutes
*Timestamp:* ${payload.timestamp.toISOString()}
${payload.details ? `*Details:*\n\`\`\`\n${JSON.stringify(payload.details, null, 2)}\n\`\`\`` : ''}
`;

      const response = await axios.post(apiUrl, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      });

      if (response.status !== 200) {
        throw new Error(`Telegram notification failed with status ${response.status}`);
      }
      
      console.log(`Telegram notification sent successfully to ${chatId}`);
    } catch (error) {
      console.error('Telegram notification failed:', error);
      throw error;
    }
  }
}

export default NotificationService;