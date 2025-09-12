import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRoutes from './routes/user.routes';

app.use('/api', userRoutes);


export default app;