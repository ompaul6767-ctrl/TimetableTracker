import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { prisma } from './lib/prisma';

const app = express();

const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));

const isOriginAllowed = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview/deployment URLs for any configured *.vercel.app origin
  return allowedOrigins.some((allowed) => {
    const match = allowed.match(/^https:\/\/([a-z0-9-]+)\.vercel\.app$/i);
    if (!match) return false;
    const projectPrefix = match[1];
    return new RegExp(`^https://${projectPrefix}(-[a-z0-9-]+)?\\.vercel\\.app$`, 'i').test(origin);
  });
};

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// API Routes
app.use('/api/v1', apiRoutes);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`\n🚀 CTMS Server running on http://localhost:${env.PORT}`);
      console.log(`📡 API Base: http://localhost:${env.PORT}/api/v1`);
      console.log(`🏥 Health:   http://localhost:${env.PORT}/api/v1/health`);
      console.log(`🌐 Client:   ${env.CLIENT_URL}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
