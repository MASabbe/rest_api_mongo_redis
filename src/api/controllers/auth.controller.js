import httpStatus from 'http-status';
import {jwtExpirationInterval} from '../../config/vars';
import {DateTime} from 'luxon';
import ApiError from '../errors/api-error';
import User from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import PasswordResetToken from '../models/passwordResetToken.model';
/**
 * Generates a token response for the given user and access token.
 *
 * @param {object} user - The user object.
 * @param {string} accessToken - The access token.
 * @return {object} - The token response object containing the token type,
 * access token, refresh token, and expiration time.
 * @private
 */
const generateTokenResponse = async (user, accessToken) => {
  const tokenType = 'Bearer';
  const refreshToken = await RefreshToken.generate(user).token;
  const expiresIn = DateTime.utc().plus({minute: jwtExpirationInterval});
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
};
/**
 * Register a new user with unique username and email.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @return {Promise<void>} This function does not return anything directly, but it calls the next middleware function
 */
const register = async (req, res, next) => {
  try {
    const {username, email, password} = req.body;
    const uniqueUsername = await User.findOne({username});
    if (uniqueUsername) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: 'Username already taken',
        isPublic: true,
      });
    }
    const uniqueEmail = await User.findOne({email});
    if (uniqueEmail) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: 'Email already taken',
        isPublic: true,
      });
    }
    const user = await new User({username, email, password}).save();
    const token = await generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data: {
        user: user.transform(),
        token,
      },
    });
  } catch (e) {
    next(e);
  }
};
/**
 * Function to handle user login.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise<void>} Promise that resolves when login is handled.
 */
const login = async (req, res, next) => {
  try {
    const {user, accessToken} = await User.findAndGenerateToken(req.body);
    const token = await generateTokenResponse(user, accessToken);
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data: {
        user: user.transform(),
        token,
      },
    });
  } catch (e) {
    next(e);
  }
};
/**
 * Generates an OAuth response with user details and token.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @param {Function} next - the next function in middleware
 * @return {void}
 */
const oAuth = (req, res, next) => {
  try {
    const {user} = req;
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data: {
        user: user.transform(),
        token,
      },
    });
  } catch (e) {
    next(e);
  }
};
/**
 * Refreshes the user token and sends a success response with the updated token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise} A Promise that resolves when the token is refreshed and response is sent.
 */
const refresh = async (req, res, next) => {
  try {
    const {user, accessToken} = await User.findAndGenerateToken(req.body);
    const token = await generateTokenResponse(user, accessToken);
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data: {
        user: user.transform(),
        token,
      },
    });
  } catch (e) {
    next(e);
  }
};
/**
 * Sends a password reset request based on the provided username or email.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise<void>} Promise that resolves when the password reset request is processed.
 */
const sendPasswordReset = async (req, res, next) => {
  try {
    const {username, email} = req.body;
    const user = await User.findOne(username ? {username} : {email});
    if (!user) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: 'User not found',
        isPublic: true,
      });
    }
    await PasswordResetToken.generate(user);
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
    });
  } catch (e) {
    next(e);
  }
};
/**
 * Reset user password based on provided reset token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise<void>} Promise that resolves when password is reset.
 */
const resetPassword = async (req, res, next) => {
  try {
    const {email, password, resetToken} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: 'User not found',
        isPublic: true,
      });
    }
    const token = await PasswordResetToken.findOne({token: resetToken});
    if (!token) {
      throw new ApiError({
        status: httpStatus.UNAUTHORIZED,
        message: 'Invalid reset token',
        isPublic: true,
      });
    }
    const expiredAt = DateTime.fromJSDate(token.expiredAt);
    if (expiredAt < DateTime.utc()) {
      throw new ApiError({
        status: httpStatus.UNAUTHORIZED,
        message: 'Expired reset token',
        isPublic: true,
      });
    }
    user.password = password;
    await user.save();
    res.status(httpStatus.CREATED);
    res.json({
      message: 'updated successfully',
      success: true,
    });
  } catch (e) {
    next(e);
  }
};
export default {
  register,
  login,
  oAuth,
  refresh,
  sendPasswordReset,
  resetPassword,
};
