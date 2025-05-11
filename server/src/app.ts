import express from 'express';
import cors from 'cors';
import anomalyRoutes from './routes/anomalyRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/anomalies', anomalyRoutes);

export default app; 