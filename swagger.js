const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ride Management API',
      version: '1.0.0',
      description: 'This API is designed to manage rides, providing endpoints for health checks, creating new rides with detailed validation, retrieving a list of all rides, and retrieving ride details by ID. The API adheres to standard HTTP status codes and incorporates robust error handling for scenarios such as validation errors, resource not found errors, and server errors. Swagger documentation is integrated to offer clear insights into available endpoints, request/response structures, and error handling.',
    },
    servers: [
      {
        url: 'http://YOUR_SERVER_URL',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

// Add components section
swaggerSpec.components = {
  schemas: {
    Ride: {
      type: 'object',
      properties: {
        rideID: { type: 'integer' },
        startLat: { type: 'number' },
        startLong: { type: 'number' },
        endLat: { type: 'number' },
        endLong: { type: 'number' },
        riderName: { type: 'string' },
        driverName: { type: 'string' },
        driverVehicle: { type: 'string' },
        created: { type: 'string', format: 'date-time' },
      },
    },
    ValidationError: {
      type: 'object',
      properties: {
        error_code: { type: 'string' },
        message: { type: 'string' },
      },
    },
    ServerError: {
      type: 'object',
      properties: {
        error_code: { type: 'string' },
        message: { type: 'string' },
      },
    },
    NotFoundError: {
      type: 'object',
      properties: {
        error_code: { type: 'string', example: 'NOT_FOUND_ERROR' },
        message: { type: 'string', example: 'Resource not found' },
      },
    },
  },
};

module.exports = swaggerSpec;
