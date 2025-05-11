import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

export interface ApiKeyAttributes {
  id?: number;
  projectId: string;
  key: string;
  active: boolean;
}

class ApiKey extends Model<ApiKeyAttributes> implements ApiKeyAttributes {
  public id!: number;
  public projectId!: string;
  public key!: string;
  public active!: boolean;

  public static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

ApiKey.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    sequelize,
    modelName: 'ApiKey',
    tableName: 'api_keys',
    hooks: {
      beforeCreate: (apiKey: ApiKey) => {
        if (!apiKey.key) {
          apiKey.key = ApiKey.generateKey();
        }
      }
    }
  }
);

export { ApiKey }; 