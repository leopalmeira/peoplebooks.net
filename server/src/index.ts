import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and utility middlewares
app.use(cors({
  origin: true, // Allow dev frontend and preview domains
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, _res, next) => {
  if (env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'PeopleBooks API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API router
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10) || 3001;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`📚 PeopleBooks.net API Server running on port ${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Ready at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

export default app;

