const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const reqStats = require("./loggger/requestLogger");

const app = express();
const port = 8010;

const jsonParser = bodyParser.json();
app.use(jsonParser);

const db = new sqlite3.Database(':memory:');

// Import Schemas
const buildSchemas = require('./src/schemas');
const swaggerSpec = require('./swagger');
const appModule = require('./src/app')(db);
app.use(reqStats());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize and start the server
db.serialize(() => {
  buildSchemas(db);
  app.use('/', appModule);

  app.listen(port, () => console.log(`App started and listening on port ${port}`));
});