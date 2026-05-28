export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type RoleType = keyof typeof ROLES;

export const EMERGENCY_TYPES = {
  HOSPITAL: 'HOSPITAL',
  AMBULANCE: 'AMBULANCE',
  POLICE: 'POLICE',
  TOWING: 'TOWING',
  RESCUE: 'RESCUE',
} as const;

export const SOS_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const NOTIFICATION_TYPES = {
  SOS_UPDATE: 'SOS_UPDATE',
  EMERGENCY_ALERT: 'EMERGENCY_ALERT',
  SYSTEM: 'SYSTEM',
  PROMOTION: 'PROMOTION',
  ACCOUNT: 'ACCOUNT',
} as const;

export const OTP_PURPOSES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export const CACHE_KEYS = {
  OTP: (email: string, purpose: string) => `otp:${email}:${purpose}`,
  USER: (id: string) => `user:${id}`,
  REFRESH_TOKEN: (userId: string) => `refresh:${userId}`,
  RATE_LIMIT: (ip: string) => `rate:${ip}`,
  SOS_ACTIVE: (userId: string) => `sos:active:${userId}`,
  NEARBY_SERVICES: (lat: number, lng: number, type: string) =>
    `services:${lat.toFixed(2)}:${lng.toFixed(2)}:${type}`,
} as const;

export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 1800,         // 30 minutes
  VERY_LONG: 86400,   // 24 hours
  OTP: 600,           // 10 minutes
  SESSION: 604800,    // 7 days
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SOS_CREATE: 'sos:create',
  LOCATION_UPDATE: 'location:update',

  // Server -> Client
  SOS_NEW: 'sos:new',
  SOS_STATUS_UPDATED: 'sos:status_updated',
  NOTIFICATION_NEW: 'notification:new',
  EMERGENCY_BROADCAST: 'emergency:broadcast',
  LOCATION_SHARE: 'location:share',
} as const;
