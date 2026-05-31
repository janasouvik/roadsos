import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { requestLogger } from './middlewares/requestLogger';
import { swaggerSpec } from './docs/swagger';
import logger from './config/logger';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import sosRoutes from './routes/sos.routes';
import contactRoutes from './routes/contact.routes';
import serviceRoutes from './routes/service.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';

const app: Application = express();

// ============================
// SECURITY MIDDLEWARE
// ============================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
}));

// ============================
// RATE LIMITING
// ============================
app.use('/api/', rateLimiter);

// ============================
// BODY PARSERS
// ============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ============================
// LOGGING
// ============================
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) }
  }));
}
app.use(requestLogger);

// ============================
// STATIC FILES
// ============================
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ============================
// SWAGGER DOCS
// ============================
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #EF4444; }',
  customSiteTitle: 'RoadSOS API Documentation',
}));

// ============================
// HEALTH CHECK
// ============================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'RoadSOS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// ============================
// API ROUTES
// ============================
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/sos`, sosRoutes);
app.use(`${API_PREFIX}/contacts`, contactRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// ============================
// 404 & ERROR HANDLERS
// ============================
app.use(notFound);
app.use(errorHandler);

export default app;
