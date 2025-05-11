import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface EventAttributes {
  id: number;
  type: 'event' | 'metric';
  name: string;
  properties?: Record<string, any>;
  value?: number;
  tags?: Record<string, string>;
  timestamp: Date;
  traceId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCreationAttributes = Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public type!: 'event' | 'metric';
  public name!: string;
  public properties?: Record<string, any>;
  public value?: number;
  public tags?: Record<string, string>;
  public timestamp!: Date;
  public traceId?: string;
  public sessionId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    traceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'events',
    indexes: [
      {
        fields: ['traceId']
      },
      {
        fields: ['sessionId']
      }
    ]
  }
); 