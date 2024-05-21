/**
 * Initializes a new instance of the Error class.
 *
 * @param {Object} options - The options object.
 * @param {string} options.message - The error message.
 * @param {Array} options.errors - The array of error objects.
 * @param {number} options.status - The status code.
 * @param {boolean} options.isPublic - Indicates if the error is public.
 * @param {string} options.code - The error code.
 * @return {void}
 */
export default class ExtendableError extends Error {
  /**
   * Constructor for creating a new instance of the class.
   *
   * @param {Object} options - The options object.
   * @param {string} options.message - The error message.
   * @param {Array} options.errors - The array of errors.
   * @param {number} options.status - The status code.
   * @param {boolean} options.isPublic - If the error is public or not.
   * @param {string} options.code - The error code.
   * @return {void}
   */
  constructor({message, errors, status, isPublic, code}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.code = code;
    this.isPublic = isPublic;
    this.isOperational = true;
  }
}
