const validateRideRequest = (body) => {
  const {
    start_lat: startLatitude,
    start_long: startLongitude,
    end_lat: endLatitude,
    end_long: endLongitude,
    rider_name: riderName,
    driver_name: driverName,
    driver_vehicle: driverVehicle,
  } = body;

  const validationErrors = [];

  validateCoordinates(startLatitude, startLongitude, 'Start', validationErrors);
  validateCoordinates(endLatitude, endLongitude, 'End', validationErrors);
  validateNonEmptyString(riderName, 'Rider name', validationErrors);
  validateNonEmptyString(driverName, 'Driver name', validationErrors);
  validateNonEmptyString(driverVehicle, 'Driver vehicle', validationErrors);

  return validationErrors;
};

const validateCoordinates = (latitude, longitude, type, errors) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    errors.push({
      error_code: 'VALIDATION_ERROR',
      message: `${type} latitude and longitude must be between -90 -90 & -180 to 180 degrees respectively`,
    });
  }
};

const validateNonEmptyString = (value, type, errors) => {
  if (typeof value !== 'string' || value.length < 1) {
    errors.push({
      error_code: 'VALIDATION_ERROR',
      message: `${type} must be a non-empty string`,
    });
  }
};

module.exports = {
  validateCoordinates,
  validateNonEmptyString,
  validateRideRequest,
};