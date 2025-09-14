import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';

app.use('/api', userRoutes);
app.use('/api', paymentRoutes);
app.use('/api', adminRoutes);


export default app;