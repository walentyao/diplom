import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('logs', 'severityScore', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('logs', 'severityScore');
} 