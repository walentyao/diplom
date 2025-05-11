import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export interface ErrorAttributes {
  id?: number;
  timestamp: Date;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
}

class Error extends Model<ErrorAttributes> implements ErrorAttributes {
  public id!: number;
  public timestamp!: Date;
  public message!: string;
  public stack!: string;
  public metadata!: Record<string, any>;
}

Error.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'Error',
    tableName: 'errors',
    timestamps: true,
  }
);

export { Error }; 