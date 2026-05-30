import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { morganStream } from './config/logger';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes/index';

const createApp = (): Application => {
  const app = express();

  // ========================
  // Security Middlewares
  // ========================
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for Swagger UI
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        },
      },
    }),
  );

  // ========================
  // CORS
  // ========================
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost', 'capacitor://localhost', 'http://10.240.125.164:5173'];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
    }),
  );

  // ========================
  // General Middlewares
  // ========================
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ========================
  // HTTP Request Logging
  // ========================
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
        stream: morganStream,
      }),
    );
  }

  // ========================
  // Rate Limiting
  // ========================
  app.use('/api', apiLimiter);

  // ========================
  // Static Files (Uploads)
  // ========================
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ========================
  // Swagger Documentation
  // ========================
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'ROADSOS API Docs',
      customCss: `
        .swagger-ui .topbar { background: linear-gradient(135deg, #ff1e2d, #c40017); }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
        body { background: #0a0a0f; }
      `,
    }),
  );

  // Expose raw Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ========================
  // API Routes
  // ========================
  app.use(routes);

  // ========================
  // Error Handling
  // ========================
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
