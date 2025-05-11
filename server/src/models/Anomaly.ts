import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export interface AnomalyAttributes {
  id?: number;
  type: string;
  projectId: string;
  detectedAt: Date;
  currentHourCount: number;
  average24hCount: number;
  threshold: number;
}

export class Anomaly extends Model<AnomalyAttributes> implements AnomalyAttributes {
  public id!: number;
  public type!: string;
  public projectId!: string;
  public detectedAt!: Date;
  public currentHourCount!: number;
  public average24hCount!: number;
  public threshold!: number;
}

Anomaly.init(
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
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    currentHourCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    average24hCount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    threshold: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Anomaly',
    tableName: 'anomalies',
    timestamps: true,
  }
); 