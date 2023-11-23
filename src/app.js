'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
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
  app.get('/health', (req, res) => res.send('Healthy'));

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
  app.post('/rides', jsonParser, (req, res) => {

    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      });
    }

    var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

    const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        });
      }

      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
        if (err) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          });
        }

        res.send(rows);
      });
    });
  });

  /**
   * @swagger
   * /rides:
   *   get:
   *     summary: Get all rides
   *     description: Retrieve a list of all rides.
   *     responses:
   *       200:
   *         description: List of rides
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
  app.get('/rides', (req, res) => {
    db.all('SELECT * FROM Rides', function (err, rows) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      }

      res.send(rows);
    });
  });


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
  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      }

      res.send(rows);
    });
  });

  return app;
};
