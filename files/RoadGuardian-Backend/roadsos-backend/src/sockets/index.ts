import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../config/logger';

let io: Server;

// Connected users map: userId -> socketId
const userSockets = new Map<string, string>();

export const initializeSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ============================
  // AUTHENTICATION MIDDLEWARE
  // ============================
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ============================
  // CONNECTION HANDLER
  // ============================
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;

    userSockets.set(userId, socket.id);
    logger.info(`Socket connected: ${userId} (${socket.id})`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Admins join admin room
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      socket.join('admin');
      logger.info(`Admin joined admin room: ${userId}`);
    }

    // ============================
    // LOCATION SHARING
    // ============================
    socket.on('location:update', (data: { latitude: number; longitude: number; sosId?: string }) => {
      logger.debug(`Location update from ${userId}:`, data);
      // Broadcast to admin room
      socket.to('admin').emit('location:updated', {
        userId,
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================
    // SOS EVENTS
    // ============================
    socket.on('sos:join', (sosId: string) => {
      socket.join(`sos:${sosId}`);
      logger.info(`User ${userId} joined SOS room: ${sosId}`);
    });

    socket.on('sos:leave', (sosId: string) => {
      socket.leave(`sos:${sosId}`);
    });

    // ============================
    // DISCONNECT
    // ============================
    socket.on('disconnect', () => {
      userSockets.delete(userId);
      logger.info(`Socket disconnected: ${userId} (${socket.id})`);
    });

    // ============================
    // PING/PONG
    // ============================
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  logger.info('Socket.IO server initialized');
};

// ============================
// EMIT HELPERS (used by services)
// ============================

export const emitToUser = (userId: string, event: string, data: any): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToSosRoom = (sosId: string, event: string, data: any): void => {
  if (!io) return;
  io.to(`sos:${sosId}`).emit(event, data);
};

export const emitToAdmins = (event: string, data: any): void => {
  if (!io) return;
  io.to('admin').emit(event, data);
};

export const emitToAll = (event: string, data: any): void => {
  if (!io) return;
  io.emit(event, data);
};

export const broadcastEmergencyAlert = (sosData: {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  address?: string;
}): void => {
  emitToAdmins('emergency:new', {
    ...sosData,
    timestamp: new Date().toISOString(),
  });
  emitToUser(sosData.userId, 'sos:confirmed', {
    sosId: sosData.id,
    message: 'Your SOS alert has been received. Help is on the way.',
    timestamp: new Date().toISOString(),
  });
};

export const broadcastSosStatusUpdate = (sosId: string, userId: string, status: string, assignedService?: string): void => {
  emitToSosRoom(sosId, 'sos:status', { sosId, status, assignedService, timestamp: new Date().toISOString() });
  emitToUser(userId, 'sos:status', { sosId, status, assignedService, timestamp: new Date().toISOString() });
};

export const getIo = (): Server => io;
