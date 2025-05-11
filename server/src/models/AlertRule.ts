import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export interface AlertRuleAttributes {
  id: number;
  type: 'error' | 'performance' | 'request' | 'custom_event';
  threshold: number;
  intervalMinutes: number;
  level?: 'info' | 'warn' | 'error' | 'critical';
  projectId: string;
  isActive: boolean;
  lastChecked?: Date;
  notifyType: 'email' | 'webhook' | 'slack' | 'telegram';
  notifyTarget: string;
}

class AlertRule extends Model<AlertRuleAttributes> implements AlertRuleAttributes {
  public id!: number;
  public type!: 'error' | 'performance' | 'request' | 'custom_event';
  public threshold!: number;
  public intervalMinutes!: number;
  public level?: 'info' | 'warn' | 'error' | 'critical';
  public projectId!: string;
  public isActive!: boolean;
  public lastChecked?: Date;
  public notifyType!: 'email' | 'webhook' | 'slack' | 'telegram';
  public notifyTarget!: string;
}

AlertRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['error', 'performance', 'request', 'custom_event']],
      },
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    intervalMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['info', 'warn', 'error', 'critical']],
      },
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastChecked: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notifyType: {
      type: DataTypes.ENUM('email', 'webhook', 'slack', 'telegram'),
      allowNull: false,
      defaultValue: 'webhook',
    },
    notifyTarget: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AlertRule',
    tableName: 'alert_rules',
    timestamps: true,
  }
);

export default AlertRule;