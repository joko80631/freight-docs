import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: ['https://freight-docs.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ... rest of the existing code ... 