import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
