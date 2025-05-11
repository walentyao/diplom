import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import logRoutes from './routes/logRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import eventRoutes from './routes/eventRoutes';
import anomalyRoutes from './routes/anomalyRoutes'; // Добавлен импорт маршрутов аномалий
import AlertService from './services/alertService.js';
import { AnomalyService } from './services/anomalyService'; // Добавлен импорт сервиса аномалий

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/anomalies', anomalyRoutes); // Добавлены маршруты аномалий

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized.');

    // Initialize alert service
    const alertService = AlertService.getInstance();
    
    // Add default console.log callback for alerts
    alertService.addCallback((rule, count) => {
      console.log(`ALERT: Rule ${rule.id} triggered! Found ${count} events in the last ${rule.intervalMinutes} minutes.`);
      console.log('Rule details:', {
        type: rule.type,
        level: rule.level,
        projectId: rule.projectId,
        threshold: rule.threshold
      });
    });

    // Start checking for alerts
    await alertService.startChecking();
    console.log('Alert service started');
    
    // Initialize anomaly service
    const anomalyService = AnomalyService.getInstance();
    await anomalyService.startPeriodicCheck();
    console.log('Anomaly service started');
    
    // Start listening
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();