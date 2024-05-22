import User from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import httpStatus from 'http-status';
import {jwtExpirationInterval} from '../../config/vars';
import {DateTime} from 'luxon';
import ApiError from '../errors/api-error';

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
const login = async (req, res, next) => {
  try {
    const {user, accessToken} = await User.findAndGenerateToken(req.body);
    const token = await generateTokenResponse(user, accessToken);
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data:{
          user: user.transform(),
          token
      }
    });
  } catch (e) {
    next(e);
  }
};
const refresh = async (req, res, next) => {
  try {
    const {user, accessToken} = await User.findAndGenerateToken(req.body);
    const token = await generateTokenResponse(user, accessToken);
    res.status(httpStatus.CREATED);
    res.json({
      message: 'success',
      success: true,
      data:{
        user: user.transform(),
        token
      }
    });
  } catch (e) {
    next(e);
  }
};
const sendPasswordReset = async (req, res, next) => {
  try {

  } catch (e) {
    next(e);
  }
};
const resetPassword = async (req, res, next) => {
  try {

  } catch (e) {
    next(e);
  }
};
export default {
  register,
  login,
  refresh,
  sendPasswordReset,
  resetPassword,
};
