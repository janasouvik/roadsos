import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🛡️ RoadSOS Emergency Response API',
      version: '1.0.0',
      description: `
# Road Guardian | AI Emergency Response Platform

Production-grade REST API for real-time emergency response and roadside rescue.

## Features
- 🔐 JWT Authentication with refresh token rotation
- 🚨 SOS Emergency Request System
- 🗺️ Geo-location based nearby service search
- 💬 Real-time updates via Socket.IO
- 📧 Email notifications to emergency contacts
- 👮 Role-based access control (USER / ADMIN / SUPER_ADMIN)
- 📊 Analytics dashboard

## Authentication
Use **Bearer Token** in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Rate Limits
- General: 100 req / 15 min
- Auth endpoints: 10 req / 15 min
- SOS: 5 req / 5 min
      `,
      contact: {
        name: 'Road Guardian Support',
        email: 'support@roadguardian.com',
      },
      license: { name: 'MIT' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api/v1`, description: 'Development' },
      { url: 'https://api.roadguardian.com/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SosRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            address: { type: 'string' },
            emergencyType: { type: 'string', enum: ['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE'] },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Users', description: 'User profile management' },
      { name: 'SOS', description: 'Emergency SOS requests' },
      { name: 'Contacts', description: 'Emergency contacts' },
      { name: 'Services', description: 'Nearby emergency services' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Admin', description: 'Admin panel endpoints' },
    ],
    paths: {
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullName', 'email', 'password'],
                  properties: {
                    fullName: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    phone: { type: 'string', example: '+919876543210' },
                    password: { type: 'string', example: 'SecurePass123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/sos/create': {
        post: {
          tags: ['SOS'],
          summary: 'Trigger emergency SOS',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['latitude', 'longitude', 'emergencyType'],
                  properties: {
                    latitude: { type: 'number', example: 12.9716 },
                    longitude: { type: 'number', example: 77.5946 },
                    address: { type: 'string', example: 'MG Road, Bengaluru' },
                    emergencyType: { type: 'string', enum: ['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE'] },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'SOS triggered' },
            401: { $ref: '#/components/responses/Unauthorized' },
            429: { description: 'Too many requests' },
          },
        },
      },
      '/services/nearby': {
        get: {
          tags: ['Services'],
          summary: 'Get nearby emergency services',
          parameters: [
            { name: 'latitude', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'longitude', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'radius', in: 'query', schema: { type: 'number', default: 10 }, description: 'Radius in km' },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE'] } },
          ],
          responses: {
            200: { description: 'Nearby services returned' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
