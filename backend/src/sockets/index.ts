import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/tokenUtils';
import { db } from '../config/database';
import { SOCKET_EVENTS } from '../constants';

let io: SocketServer | null = null;

export const getSocketServer = (): SocketServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const initSocketServer = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ========================
  // Authentication Middleware
  // ========================
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        // Allow unauthenticated connections for public rooms
        socket.data.userId = null;
        return next();
      }

      const payload = verifyAccessToken(token);
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, isBlocked: true },
      });

      if (!user || user.isBlocked) {
        return next(new Error('Authentication failed'));
      }

      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      socket.data.userId = null;
      next(); // Allow but unauthenticated
    }
  });

  // ========================
  // Connection Handler
  // ========================
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    logger.info(`Socket connected: ${socket.id}, userId: ${userId ?? 'anonymous'}`);

    // Join user's personal room
    if (userId) {
      socket.join(`user_${userId}`);
    }

    // Join admin room for admins
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      socket.join('admin_room');
      logger.info(`Admin joined admin_room: ${userId}`);
    }

    // Handle room joins
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string) => {
      socket.join(roomId);
      logger.debug(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string) => {
      socket.leave(roomId);
    });

    // Handle live location updates
    socket.on(SOCKET_EVENTS.LOCATION_UPDATE, (data: { lat: number; lng: number }) => {
      if (!userId) return;
      // Broadcast to user's emergency contacts (simplified)
      io!.to(`user_${userId}`).emit(SOCKET_EVENTS.LOCATION_SHARE, {
        userId,
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}:`, err);
    });
  });

  logger.info('✅ Socket.IO server initialized');
  return io;
};
