const request = require('supertest');
const expect = require('chai').expect;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize(() => {
      db.serialize((err) => {
        if (err) {
          return done(err);
        }

        buildSchemas(db);

        return done();
      });
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Healthy');
          return done();
        });
    });
  });
});

describe('GET /rides', () => {

  it('should return 200 with a rides not found error message if no rides are found', async () => {
    const res = await request(app).get(`/rides`);
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      error_code: 'RIDES_NOT_FOUND_ERROR',
      message: 'Could not find any rides',
    });
  });

});

describe('POST /rides', () => {
  it('should create a new ride', (done) => {
    const newRide = {
      start_lat: 10,
      start_long: 10,
      end_lat: 20,
      end_long: 20,
      rider_name: 'test',
      driver_name: 'test',
      driver_vehicle: 'test',
    };

    request(app)
      .post('/rides')
      .send(newRide)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body[0]).to.have.property('rideID');
        // Add more assertions as needed
        done();
      });
  });

  it('should return 200 with a error message if any lat, long payload will be missing', async () => {
    const newRide = {
      // start_lat: 10,
      start_long: 10,
      end_lat: 20,
      end_long: 20,
      rider_name: 'test',
      driver_name: 'test',
      driver_vehicle: 'test',
    };
    const res = await request(app).post(`/rides`).send(newRide).expect('Content-Type', /json/);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      "error_code": "SERVER_ERROR",
      "message": "Unknown error"
    });
  });

  it('should return 200 with an error message if rider_name payload is missing', async () => {
    const rideWithoutRiderName = {
      start_lat: 10,
      start_long: 20,
      end_lat: 30,
      end_long: 40,
      driver_name: 'John Doe',
      driver_vehicle: 'Car',
    };

    const res = await request(app)
      .post('/rides')
      .send(rideWithoutRiderName);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.has.lengthOf(1); // Check if the response is an array with two elements

    // Assuming that the error object is the first element in the array
    const errorObject = res.body[0];

    expect(errorObject).to.have.property('error_code', 'VALIDATION_ERROR');
    expect(errorObject).to.have.property('message', 'Rider name must be a non-empty string');
  });

  it('should return 200 with a validation error message for invalid start latitude and longitude', async () => {
    // Create a request with invalid start latitude and longitude
    const rideWithInvalidStartLocation = {
      start_lat: 100, // Invalid latitude
      start_long: -200, // Invalid longitude
      end_lat: 34.0522,
      end_long: -118.2437,
      rider_name: 'John Doe',
      driver_name: 'Jane Doe',
      driver_vehicle: 'Car',
    };

    const res = await request(app)
      .post('/rides')
      .send(rideWithInvalidStartLocation);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.has.lengthOf(1); // Check if the response is an array with one element

    const errorObject = res.body[0];

    expect(errorObject).to.have.property('error_code', 'VALIDATION_ERROR');
    expect(errorObject).to.have.property('message', 'Start latitude and longitude must be between -90 -90 & -180 to 180 degrees respectively');
  });

  it('should return 200 with a validation error message for invalid end latitude and longitude', async () => {
    // Create a request with invalid end latitude and longitude
    const rideWithInvalidEndLocation = {
      start_lat: 37.7749,
      start_long: -122.4194,
      end_lat: 100, // Invalid latitude
      end_long: -200, // Invalid longitude
      rider_name: 'John Doe',
      driver_name: 'Jane Doe',
      driver_vehicle: 'Car',
    };

    const res = await request(app)
      .post('/rides')
      .send(rideWithInvalidEndLocation);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.has.lengthOf(1); // Check if the response is an array with one element

    const errorObject = res.body[0];

    expect(errorObject).to.have.property('error_code', 'VALIDATION_ERROR');
    expect(errorObject).to.have.property('message', 'End latitude and longitude must be between -90 - 90 & -180 to 180 degrees respectively');
  });

  it('should return 200 with a validation error message if driver name is missing', async () => {
    // Create a request with missing driver name
    const rideWithMissingDriverName = {
      start_lat: 37.7749,
      start_long: -122.4194,
      end_lat: 34.0522,
      end_long: -118.2437,
      rider_name: 'John Doe',
      // Missing driver name
      driver_vehicle: 'Car',
    };

    const res = await request(app)
      .post('/rides')
      .send(rideWithMissingDriverName);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.has.lengthOf(1);

    const errorObject = res.body[0];

    expect(errorObject).to.have.property('error_code', 'VALIDATION_ERROR');
    expect(errorObject).to.have.property('message', 'Driver name must be a non-empty string');
  });
  it('should return 200 with a validation error message if driver vehicle is missing', async () => {
    // Create a request with missing driver vehicle
    const rideWithMissingDriverVehicle = {
      start_lat: 37.7749,
      start_long: -122.4194,
      end_lat: 34.0522,
      end_long: -118.2437,
      rider_name: 'John Doe',
      driver_name: 'Jane Doe',
      // Missing driver vehicle
    };

    const res = await request(app)
      .post('/rides')
      .send(rideWithMissingDriverVehicle);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.has.lengthOf(1);

    const errorObject = res.body[0];

    expect(errorObject).to.have.property('error_code', 'VALIDATION_ERROR');
    expect(errorObject).to.have.property('message', 'Driver vehicle must be a non-empty string');
  });

});


describe('GET /rides', () => {
  it('should return all the rides', (done) => {
    request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body[0]).to.have.property('rideID');
        // Add more assertions as needed
        done();
      });
  });


});


describe('GET /rides/:id', () => {
  it('should return the ride with the given ID', async () => {
    const id = 1; // replace with an existing ride ID
    const res = await request(app).get(`/rides/${id}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].rideID).to.equal(id);
  });

  it('should return 404 if no ride with the given ID exists', async () => {
    const id = 999999; // replace with a non-existing ride ID
    const res = await request(app).get(`/rides/${id}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      error_code: 'RIDES_NOT_FOUND_ERROR',
      message: 'Could not find any rides',
    });
  });

});