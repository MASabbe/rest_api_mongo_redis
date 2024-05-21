import httpStatus from 'http-status';
import expressValidation from 'express-validation';
import ApiError from '../errors/api-error';
import {env} from '../../config/vars';
/**
 * Handles errors in the API.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {void} The function does not return a value.
 */
const handler = (err, req, res, next) => {
  const response = {
    code: err.code,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    isPublic: err.isPublic,
    stack: err.stack,
  };
  if (env === 'production') {
    delete response.stack;
  }
  res.status(err.status);
  res.json(response);
};
/**
 * Converts an error object into an API error object and passes it to the error handler.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Function} - The error handler function.
 */
const converter = function(err, req, res, next) {
  let convertedError = err;
  if (err instanceof expressValidation.ValidationError) {
    const invalids = err.details.query || err.details.params || err.details.body;
    const errors = invalids.reduce((a, b)=>[...a, b], []);
    convertedError = new ApiError({
      message: 'Validation Error',
      errors: errors,
      code: err.statusCode,
      status: err.statusCode,
      isPublic: true,
      stack: err.stack,
    });
  } else if (!(err instanceof ApiError)) {
    convertedError = new ApiError({
      message: env === 'production' ? 'Internal Server Error': err.message,
      errors: err.error,
      code: httpStatus.INTERNAL_SERVER_ERROR,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      stack: err.stack,
    });
  }
  return handler(convertedError, req, res, next);
};
/**
 * Generates a function comment for the given function.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @return {object} - The result of the handler function.
 */
const notFound = function(req, res, next) {
  const err = new ApiError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res, next);
};
export default {
  handler,
  converter,
  notFound,
};
