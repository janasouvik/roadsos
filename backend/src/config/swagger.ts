import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ROADSOS Emergency Response API',
      version: '1.0.0',
      description: `
# ROADSOS Backend API

Enterprise-grade API for the ROADSOS Emergency Response Platform.

## Features
- 🔐 JWT Authentication with Refresh Tokens
- 🚨 Real-time SOS Alerts via Socket.IO
- 📍 Geo-location based Service Search
- 📧 Email Notifications with OTP
- 🛡️ Role-based Access Control
- 📊 Analytics Dashboard

## Authentication
Use the \`/api/auth/login\` endpoint to obtain a JWT token, then include it in the \`Authorization: Bearer <token>\` header.
      `,
      contact: {
        name: 'ROADSOS Team',
        email: 'support@roadsos.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
      {
        url: 'https://api.roadsos.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
            stack: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
            isVerified: { type: 'boolean' },
            isBlocked: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['fullName', 'email', 'phone', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+919876543210' },
            password: { type: 'string', minLength: 8, example: 'Password@123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'Password@123' },
          },
        },
        SosRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            address: { type: 'string' },
            emergencyType: {
              type: 'string',
              enum: ['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE'],
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Users', description: 'User profile management' },
      { name: 'SOS', description: 'Emergency SOS requests' },
      { name: 'Contacts', description: 'Emergency contacts management' },
      { name: 'Services', description: 'Nearby emergency services' },
      { name: 'Notifications', description: 'Push notifications' },
      { name: 'Admin', description: 'Admin dashboard APIs' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
