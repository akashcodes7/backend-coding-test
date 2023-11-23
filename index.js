'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 8010;

const jsonParser = bodyParser.json();
app.use(jsonParser);

const db = new sqlite3.Database(':memory:');

// Import Schemas
const buildSchemas = require('./src/schemas');
const swaggerSpec = require('./swagger')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize and start the server
db.serialize(() => {
  buildSchemas(db);

  const appModule = require('./src/app')(db);

  app.use('/', appModule);

  app.listen(port, () => console.log(`App started and listening on port ${port}`));
});