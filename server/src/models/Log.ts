import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export interface LogAttributes {
  id: number;
  type: 'error' | 'performance' | 'request' | 'custom_event';
  projectId: string;
  timestamp: Date;
  level?: 'info' | 'warn' | 'error' | 'critical';
  event?: string;
  payload?: Record<string, any>;
  data: Record<string, any>;
  fingerprint?: string;
  severityScore: number;
}

class Log extends Model<LogAttributes> implements LogAttributes {
  public id!: number;
  public type!: 'error' | 'performance' | 'request' | 'custom_event';
  public projectId!: string;
  public timestamp!: Date;
  public level?: 'info' | 'warn' | 'error' | 'critical';
  public event?: string;
  public payload?: Record<string, any>;
  public data!: Record<string, any>;
  public fingerprint?: string;
  public severityScore!: number;
}

Log.init(
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
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['info', 'warn', 'error', 'critical']],
      },
    },
    event: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    fingerprint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    severityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Log',
    tableName: 'logs',
    timestamps: false,
  }
);

export default Log; 