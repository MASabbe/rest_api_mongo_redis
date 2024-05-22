import mongoose from 'mongoose';
import {DateTime} from 'luxon';
import jwt from 'jwt-simple';
import {jwtSecret} from '../../config/vars';

/**
 * Refresh Token Schema
 * @private
 */
const resetTokenSchema = new mongoose.Schema({
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

resetTokenSchema.statics = {
  /**
     * Generates a token using the provided ID and Shakti.
     *
     * @param {type} id - The ID used to generate the token.
     * @param {string} createdAt - Created at used to generate the token.
     * @param {string} expiredAt - Expired at used to generate the token.
     * @return {string} The generated token.
     * @private
     */
  token(id, createdAt, expiredAt) {
    const payload = {
      exp: expiredAt,
      iat: createdAt,
      sub: id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  /**
     * Generate a refresh token object and saves it into the database
     *
     * @param {User} user
     * @returns {ResetTokenSchema}
     */
  generate(user) {
    const {_id, email} = user;
    const createdAt = DateTime.utc();
    const expiredAt = DateTime.utc().plus({hour: 3});
    const token = this.token(_id, createdAt.toSeconds(), expiredAt.toSeconds());
    const tokenObject = new ResetToken({
      token, userId: _id, userEmail: email, expiredAt: expiredAt.toISO(),
    });
    tokenObject.save();
    return tokenObject;
  },

};

/**
 * @typedef ResetToken
 */
const ResetToken = mongoose.model('ResetToken', resetTokenSchema);
export default ResetToken;
