const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ride Management API',
      version: '1.0.0',
      description:
        'The API doc is providing structured information about the available endpoints.',
    },
    servers: [
      {
        url: 'http://YOUR_SERVER_URL',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/*.js'],
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
