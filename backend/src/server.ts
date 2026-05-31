// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
import http from 'http';
import createApp from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { verifyMailConnection } from './config/mailer';
import { initSocketServer } from './sockets';

// Boot the server
const startServer = async () => {
  try {
    // Connect services
    await connectDatabase();
    await connectRedis();
    await verifyMailConnection();

    // Create Express app and HTTP server
    const app = createApp();
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initSocketServer(httpServer);

    // Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════╗
║       🚨 ROADSOS Backend Server Running        ║
╠═══════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(28)}║
║  Port        : ${String(env.PORT).padEnd(28)}║
║  API Docs    : http://localhost:${env.PORT}/api-docs${' '.repeat(2)}║
║  Health      : http://localhost:${env.PORT}/api/health${' '.repeat(0)}║
╚═══════════════════════════════════════════════╝
      `);
    });

    // ========================
    // Graceful Shutdown
    // ========================
    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 ${signal} received — shutting down gracefully...`);

      httpServer.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('✅ All connections closed. Goodbye!');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time — forcing exit');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
