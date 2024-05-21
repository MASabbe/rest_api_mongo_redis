import mongoose from 'mongoose';
import {appName, jwtExpirationInterval, jwtSecret} from '../../config/vars';
import bcrypt from 'bcryptjs';
import {DateTime} from 'luxon';
import jwt from 'jwt-simple';
import ApiError from '../errors/api-error';
import httpStatus from 'http-status';
import redis from '../../config/redis';

const roles = ['admin', 'user'];
/**
 * Generates a hash of the password concatenated with the app name.
 *
 * @param {string} password - The password to be hashed.
 * @return {Promise<string>} A promise that resolves to the hashed password.
 * @private
 */
const passwordHash = async (password) => {
  return await bcrypt.hash(appName.concat(password), 10);
};
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },
  firstName: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  services: {
    facebook: String,
    google: String,
  },
  role: {
    type: String,
    enum: roles,
    default: 'user',
  },
  avatar: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await passwordHash(this.password);
    return next();
  } catch (error) {
    return next(error);
  }
});
userSchema.method({
  async passwordHash(password) {
    return passwordHash;
  },
  token(id, shakti) {
    const payload = {
      exp: DateTime.utc().plus({minutes: jwtExpirationInterval}).toSeconds(),
      iat: DateTime.utc().toSeconds(),
      sub: id,
      shakti: shakti,
    };
    return jwt.encode(payload, jwtSecret);
  },
});
userSchema.static = {
  async get(id, keys = '_id') {
    let user;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await this.findById(id, keys).exec();
    }
    if (user) {
      return user;
    }
    throw new ApiError({
      message: 'User does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
  async profile(id) {
    const value = await redis.get(`${appName}:user:${id}`);
    if (value) {
      return JSON.parse(value);
    }
    const user = await this.get(id, 'email firstName lastName avatar');
    await redis.set(`${appName}:user:${id}`, JSON.stringify(user));
    return user;
  },
};
export default mongoose.model('User', userSchema);
