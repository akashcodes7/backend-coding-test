# Backend Coding Test

## Project Overview

The Backend Coding Test is a RESTful API designed to manage rides. It includes functionality to check the health of the API server, create new rides with detailed validation, retrieve a list of all rides, and retrieve ride details by ID. The API provides responses conforming to standard HTTP status codes and includes error handling for various scenarios such as validation errors, not found errors, and server errors.


## API Documentation

The API documentation is built using Swagger, providing clear and structured information about the available endpoints, request/response structures, and error handling.

### Health Check

#### Endpoint

GET /health

#### Description

Check the health of the API server.

### Create a New Ride

#### Endpoint

POST /rides

#### Description

Create a new ride with the provided details.

#### Request Body

- `start_lat`: Latitude of the starting point (number, between -90 and 90).
- `start_long`: Longitude of the starting point (number, between -180 and 180).
- `end_lat`: Latitude of the ending point (number, between -90 and 90).
- `end_long`: Longitude of the ending point (number, between -180 and 180).
- `rider_name`: Name of the rider (string, non-empty).
- `driver_name`: Name of the driver (string, non-empty).
- `driver_vehicle`: Vehicle information of the driver (string, non-empty).

#### Responses

- `200 OK`: Ride created successfully.
- `400 Bad Request`: Validation error or bad request.
- `500 Internal Server Error`: Server error.

Retrieve a list of all rides.

### Get Rides with Pagination

#### Endpoint

`GET /rides`

#### Summary

Get rides with pagination.

#### Description

Retrieve a list of rides with pagination. The number of items per page and the page number can be controlled with query parameters.

#### Query Parameters

- `page` (integer): The page number.
- `limit` (integer): The number of items to return per page.

#### Responses

- `200 OK`: A list of rides.
  - Content Type: `application/json`
  - Schema:
    ```json
    {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/Ride"
      }
    }
    ```
- `404 Not Found`: Rides not found.
  - Content Type: `application/json`
  - Schema: `NotFoundError` (Refer to `#/components/schemas/NotFoundError`)
- `500 Internal Server Error`: Server error.
  - Content Type: `application/json`
  - Schema: `ServerError` (Refer to `#/components/schemas/ServerError`)


### Get Ride by ID

#### Endpoint

GET /rides/:id

#### Description

Retrieve ride details by ID.

#### Parameters

- `id`: ID of the ride to retrieve (integer).

#### Responses

- `200 OK`: Ride details retrieved successfully.
- `404 Not Found`: Ride not found.

## API Specifications

For detailed API specifications, refer to the [Swagger Documentation](/api-docs).

## Setup

1. **Take pull from the Github repository:**

   - Fork this repository.
   - Open the repository `backend-coding-test`.

2. **Ensure Dependencies:**

   - Ensure that `node (>8.6 and <= 10)` and `npm` are installed on your machine.

3. **Install Dependencies:**

   ```bash
   npm install

   ```

4. **Run Tests:**

   ```bash
   npm test

   ```

5. **Start the Server:**

   ```bash
   npm start

   ```

6. **Test Server Health:**

   ```bash
   curl localhost:8010/health

   Expect a 200 response


   ```
[![CircleCI](https://circleci.com/gh/akashcodes7/backend-coding-test.svg?style=svg)](https://circleci.com/gh/akashcodes7/backend-coding-test)
