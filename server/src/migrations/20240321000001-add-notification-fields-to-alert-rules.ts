import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('alert_rules', 'notifyType', {
    type: DataTypes.ENUM('webhook', 'email'),
    allowNull: false,
    defaultValue: 'webhook'
  });

  await queryInterface.addColumn('alert_rules', 'notifyTarget', {
    type: DataTypes.STRING,
    allowNull: false
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('alert_rules', 'notifyTarget');
  await queryInterface.removeColumn('alert_rules', 'notifyType');
} 