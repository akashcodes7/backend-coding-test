const express = require('express');
const { promisify } = require('util');

const app = express();
const bodyParser = require('body-parser');
const { logger } = require('../logger/winston');
const { validateRideRequest } = require('./imperativeFunction');

const jsonParser = bodyParser.json();


module.exports = (db) => {
  /**
  * @swagger
  * /health:
  *   get:
  *     summary: Check the health of the API Server
  *     description: Returns a positive response indicating the server's health.
  *     responses:
  *       200:
  *         description: Returns as a positive response i.e "Healthy"
  *         content:
  *           text/plain:
  *             example: Healthy
  */
  app.get('/health', async (req, res) => res.send('Healthy'));

  /**
   * @swagger
   * /rides:
   *   post:
   *     summary: Create a new ride
   *     description: This API endpoint allows the creation of a new ride. The ride details should be included in the request body in JSON format. The API performs validation checks on the provided data, including latitude and longitude constraints, non-empty string requirements for rider name, driver name, and driver vehicle information
   *     requestBody:
   *       description: Ride details
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               start_lat:
   *                 type: number
   *                 description: Latitude of the starting point. Must be between -90 and 90.
   *               start_long:
   *                 type: number
   *                 description: Longitude of the starting point. Must be between -180 and 180.
   *               end_lat:
   *                 type: number
   *                 description: Latitude of the ending point. Must be between -90 and 90.
   *               end_long:
   *                 type: number
   *                 description: Longitude of the ending point. Must be between -180 and 180.
   *               rider_name:
   *                 type: string
   *                 description: Name of the rider. Must be a non-empty string.
   *               driver_name:
   *                 type: string
   *                 description: Name of the driver. Must be a non-empty string.
   *               driver_vehicle:
   *                 type: string
   *                 description: Vehicle information of the driver. Must be a non-empty string.
   *     responses:
   *       200:
   *         description: Ride created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ride'
   *       400:
   *         description: Validation error or bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerError'
   */

  app.post('/rides', jsonParser, (req, res) => createRide(req, res, db));
  /**
   * @swagger
   * /rides:
   *   get:
   *     summary: Get rides with pagination
   *     description: Retrieve a list of rides with pagination. The number of items per page and the page number can be controlled with query parameters.
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: The page number.
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: The number of items to return per page.
   *     responses:
   *       200:
   *         description: A list of rides.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ride'
   *       404:
   *         description: Rides not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerError'
   */

  app.get('/rides', jsonParser, (req, res) => getRides(req, res, db));

  /**
   * @swagger
   * /rides/{id}:
   *   get:
   *     summary: Get ride by ID
   *     description: Retrieve ride details by ID.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the ride to retrieve.
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Ride details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ride'
   *       404:
   *         description: Ride not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundError'
   */

  app.get('/rides/:id', jsonParser, (req, res) => getRideById(req, res, db));

  return app;
};

const createRide = async (req, res, db) => {

  const validationErrors = validateRideRequest(req.body);
  if (validationErrors.length > 0) {
    return res.send(validationErrors);
  }

  const values = [
    req.body.start_lat,
    req.body.start_long,
    req.body.end_lat,
    req.body.end_long,
    req.body.rider_name,
    req.body.driver_name,
    req.body.driver_vehicle,
  ];
  logger.info(JSON.stringify(values));
  try {
    const dbRunAsync = promisify(db.run.bind(db));
    const dbAllAsync = promisify(db.all.bind(db));
    await dbRunAsync(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values
    );
    const rows = await dbAllAsync('SELECT * FROM Rides WHERE rideID = last_insert_rowid()');
    res.send(rows);
  } catch (err) {
    logger.error(JSON.stringify(err));
    return res.send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  }
}

const getRides = async (req, res, db) => {
  try {
    const dbAllAsync = promisify(db.all.bind(db));
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const rows = await dbAllAsync('SELECT * FROM Rides LIMIT ? OFFSET ?', [limit, offset]);

    if (rows.length === 0) {
      return res.send({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      });
    }

    return res.send(rows);
  } catch (err) {
    logger.error(JSON.stringify(err));
    return res.send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  }
};

const getRideById = async (req, res, db) => {

  try {
    const dbAllAsync = promisify(db.all.bind(db));
    const rows = await dbAllAsync(
      `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
    );

    if (rows.length === 0) {
      return res.send({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      });
    }

    return res.send(rows);
  } catch (err) {
    logger.error(JSON.stringify(err));
    return res.send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  }
};