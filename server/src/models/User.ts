import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import * as argon2 from 'argon2';

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public role!: 'admin' | 'user';

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return argon2.verify(this.password, candidatePassword);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await argon2.hash(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await argon2.hash(user.password);
        }
      }
    }
  }
);

export { User };