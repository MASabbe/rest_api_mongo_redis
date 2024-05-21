import mongoose from 'mongoose';
import {DateTime} from 'luxon';
import jwt from 'jwt-simple';
import {jwtExpirationInterval, jwtSecret} from '../../config/vars';

/**
 * Generates a token using the provided ID and Shakti.
 *
 * @param {type} id - The ID used to generate the token.
 * @param {boolean} shakti - The Shakti used to generate the token.
 * @return {string} The generated token.
 * @private
 */
const token = (id, shakti) => {
  const payload = {
    exp: DateTime.utc().plus({minutes: jwtExpirationInterval}).toSeconds(),
    iat: DateTime.utc().toSeconds(),
    sub: id,
    shakti: shakti,
  };
  return jwt.encode(payload, jwtSecret);
};
/**
 * Refresh Token Schema
 * @private
 */
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: 'String',
    ref: 'User',
    required: true,
  },
  expires: {type: Date},
});

refreshTokenSchema.statics = {

  /**
     * Generate a refresh token object and saves it into the database
     *
     * @param {User} user
     * @returns {RefreshToken}
     */
  generate(user) {
    const userId = user._id;
    const userEmail = user.email;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(30, 'days').toDate();
    const tokenObject = new RefreshToken({
      token, userId, userEmail, expires,
    });
    tokenObject.save();
    return tokenObject;
  },

};

/**
 * @typedef RefreshToken
 */
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
