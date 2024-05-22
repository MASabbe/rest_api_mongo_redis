import mongoose from 'mongoose';
import {DateTime} from 'luxon';
import jwt from 'jwt-simple';
import {jwtSecret} from '../../config/vars';

/**
 * Refresh Token Schema
 * @private
 */
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    ref: 'User',
    required: true,
  },
  shakti: {
    type: Boolean,
    default: false,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

refreshTokenSchema.statics = {
  /**
   * Generates a token using the provided ID and Shakti.
   *
   * @param {type} id - The ID used to generate the token.
   * @param {boolean} shakti - The Shakti used to generate the token.
   * @param {string} createdAt - Created at used to generate the token.
   * @param {string} expiredAt - Expired at used to generate the token.
   * @return {string} The generated token.
   * @private
   */
  token(id, shakti, createdAt, expiredAt) {
    const payload = {
      exp: expiredAt,
      iat: createdAt,
      sub: id,
      shakti: shakti,
    };
    return jwt.encode(payload, jwtSecret);
  },

  /**
     * Generate a refresh token object and saves it into the database
     *
     * @param {User} user
     * @returns {RefreshToken}
     */
  generate(user) {
    const {_id, email, shakti} = user;
    const createdAt = DateTime.utc();
    const expiredAt = DateTime.utc().plus({day: 3});
    const token = this.token(_id, shakti, createdAt.toSeconds(), expiredAt.toSeconds());
    const tokenObject = new RefreshToken({
      token, userId: _id, userEmail: email, expiredAt: expiredAt.toISO(),
    });
    tokenObject.save();
    return tokenObject;
  },

};

/**
 * @typedef RefreshToken
 */
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
