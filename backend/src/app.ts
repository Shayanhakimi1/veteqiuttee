import express from 'express';
import cors from 'cors';

// Import routes
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import consultationRoutes from './routes/consultation.routes';
import mediaRoutes from './routes/media.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);
app.use('/api', paymentRoutes);
app.use('/api', adminRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/media', mediaRoutes);

export default app;