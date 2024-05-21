import httpStatus from 'http-status';
import ExtendableError from './extandable-error';

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class ApiError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {object} errors
   * @param {number} code - code of error.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   * @param {object} stack
   */
  constructor({message, errors, stack, code, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false}) {
    super({message, errors, stack, code, status, isPublic});
  }
}
export default ApiError;
