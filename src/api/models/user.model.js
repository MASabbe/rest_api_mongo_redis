import mongoose from 'mongoose';
import {appName, jwtExpirationInterval, jwtSecret} from '../../config/vars';
import bcrypt from 'bcryptjs';
import {DateTime} from 'luxon';
import pick from 'lodash/pick';
import jwt from 'jwt-simple';
import ApiError from '../errors/api-error';
import httpStatus from 'http-status';
import redis from '../../config/redis';
import RefreshToken from './refreshToken.model';
import {isNotEmpty, now} from "../../helper/Util.helper";

const roles = ['admin', 'user'];
const passwordHash = async (password) => await bcrypt.hash(password, 10);
const passwordMatches = async (password, hash) => await bcrypt.compare(password, hash);
/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
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
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  banned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await this.passwordHash(this.password);
    return next();
  } catch (error) {
    return next(error);
  }
});
userSchema.method({
  /**
   * Generates a hash of the password concatenated with the app name.
   *
   * @param {string} password - The password to be hashed.
   * @return {Promise<function(*): Promise<*>>} A promise that resolves to the hashed password.
   * @private
   */
  async passwordHash(password) {
    return passwordHash(password);
  },
  /**
   * Check if the provided password matches the stored password.
   *
   * @param {string} password - The password to compare.
   * @return {boolean} Returns true if the passwords match, false otherwise.
   */
  async passwordMatches(password) {
    return passwordMatches(password, this.password);
  },
  /**
   * A function that generates a token based on the provided id and shakti.
   *
   * @param {type} id - description of the id parameter
   * @param {type} shakti - description of the shakti parameter
   * @return {type} description of the generated token
   */
  token() {
    const payload = {
      exp: DateTime.utc().plus({minutes: jwtExpirationInterval}).toSeconds(),
      iat: DateTime.utc().toSeconds(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },
  transform() {
    const fields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'avatar', 'status','banned','createdAt', 'updatedAt'];
    return pick(this, fields);
  },
});
userSchema.statics = {
  /**
   * Get a user by ID and specified keys.
   *
   * @param {type} id - description of the ID parameter
   * @param {type} keys - description of the keys parameter
   * @return {type} the user object if found, otherwise throw an ApiError
   */
  async get(id, keys) {
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
  /**
   * Retrieves the user profile from Redis cache if available,
   * otherwise fetches it from the database, stores it in the cache,
   * and returns it.
   *
   * @param {type} id - description of parameter
   * @return {type} description of return value
   */
  async profile(id) {
    const value = await redis.get(`${appName}:user:${id}`);
    if (value) {
      return JSON.parse(value);
    }
    const user = await this.get(id).then(user => user.transform());
    await redis.set(`${appName}:user:${id}`, JSON.stringify(user),{
      EX: 1800,
      NX: true
    });
    return user;
  },
  /**
   * Find a user based on provided data and generate a token for authentication.
   *
   * @param {Object} data - An object containing user data such as username, email, password, and refreshToken.
   * @return {Object} An object containing the user information and an access token.
   */
  async findAndGenerateToken(data) {
    const {username, email, password, refreshToken} = data;
    const error = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    const user = await this.findOne(username ? {username} : {email}).exec();
    if (!user) {
      throw new ApiError({
        ...error,
        message: `Invalid username or email. Not found.`,
        code: 1001,
      });
    }
    if (refreshToken) {
      const check = await RefreshToken.findOneAndDelete({token: refreshToken}).exec();
      if (!check) {
        throw new ApiError({
          ...error,
          message: `Invalid refresh token. Not found.`,
          code: 1002,
        });
      }
      const expiredAt = DateTime.fromJSDate(check.expiredAt);
      if (now > expiredAt) {
        throw new ApiError({
          ...error,
          message: `Refresh token expired. Please login again.`,
          code: 1003,
        });
      }
    } else {
      const match = await passwordMatches(password, user.password);
      if (!match) {
        throw new ApiError({
          ...error,
          message: `Invalid password. Password did not match.`,
          code: 1004,
        });
      }
    }
    if (user.banned) {
      throw new ApiError({
        ...error,
        message: `User is banned. Please contact our customer service`,
        code: 1005,
      });
    }
    if (user.status !== 1) {
      throw new ApiError({
        ...error,
        message: `Inactive member. Please activate first.`,
        code: 1006,
      });
    }
    return { user, accessToken: user.token() };
  },
  async list(query) {
    const {page,perPage,search,dir,username,email,firstName,lastName} = query;
    const orderBy = dir === 'asc' ? 1 : -1;
    const conditions = {};
    if (isNotEmpty(search)){
      conditions.$or = [
        {username: {$regex: search, $options: 'i'}},
        {email: {$regex: search, $options: 'i'}},
        {firstName: {$regex: search, $options: 'i'}},
        {lastName: {$regex: search, $options: 'i'}},
      ];
    }
    if (isNotEmpty(username)){
      conditions.username = username;
    }
    if (isNotEmpty(email)){
      conditions.email = email;
    }
    if (isNotEmpty(firstName)){
      conditions.firstName = firstName;
    }
    if (isNotEmpty(lastName)){
      conditions.lastName = lastName;
    }
    const data = await this.find(conditions)
        .sort({ createdAt: orderBy })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    const total = await this.countDocuments();
    const filtered = isNotEmpty(search) || isNotEmpty(username) || isNotEmpty(email) || isNotEmpty(firstName) || isNotEmpty(lastName) ? await this.countDocuments(conditions) : 0;
    return {
      data: data.map(v=>v.transform()),
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  },
};
const User = mongoose.model('User', userSchema);
export default User;
