import http from 'http';
import app from './app';
import { initializeSocket } from './sockets';
import { connectDatabase } from './database';
import { connectRedis } from './config/redis';
import logger from './config/logger';
import { env } from './config/env';

const PORT = env.PORT;

async function startServer() {
  try {
    // Connect to Database
    await connectDatabase();
    logger.info('✅ PostgreSQL connected via Prisma');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);
    logger.info('✅ Socket.IO initialized');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 RoadSOS Backend running on port ${PORT}`);
      logger.info(`📖 Swagger docs: http://localhost:${PORT}/api/docs`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
