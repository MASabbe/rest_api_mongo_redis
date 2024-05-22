import httpStatus from 'http-status';
import passport from 'passport';
import util from 'util';
import {appName, appVersion, jwtSecret} from '../../config/vars';
import EncodeDecode from '../../helper/EncodeDecode.helper';
import userModel from '../models/user.model';
import ApiError from '../errors/api-error';
import * as hashids from '../../config/hashids';

const encDec = new EncodeDecode(jwtSecret);
const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  const error = err || info;
  const logIn = util.promisify(req.logIn);
  const apiError = new ApiError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });
  try {
    if (error || !user) throw error;
    await logIn(user, {session: false});
  } catch (e) {
    return next(apiError);
  }
  if (!user || err) {
    return next(apiError);
  }
  if (roles === LOGGED_USER) {
    if (hashids.decodeHex(req.params.userId) !== user.id) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden';
      return next(apiError);
    }
  } else if (roles === ADMIN) {
    if (user.role !== 'admin') {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden 2';
      return next(apiError);
    }
  }
  req.user = user;
  return next();
};
export const ADMIN = 'admin';
export const LOGGED_USER = '_loggedUser';
export const authorize = (roles = userModel.roles) => (req, res, next) => passport.authenticate(
    'jwt', {session: false},
    handleJWT(req, res, next, roles),
)(req, res, next);
export const authenticate = (req, res, next) => {
  const err = new ApiError({
    message: 'Unauthorized api connection.',
    status: httpStatus.UNAUTHORIZED,
  });
  try {
    if (!req.headers.hasOwnProperty('signature')) {
      err.message += ` No signature`;
      return next(err);
    }
    const signature = req.headers.signature;
    const {app, version} = encDec.dec(signature);
    if (app !== appName) {
      err.message += ` Invalid application name`;
      return next(err);
    }
    if (Number(version) !== Number(appVersion)) {
      err.message += ` Invalid application version`;
      return next(err);
    }
    next();
  } catch (e) {
    next(err);
  }
};
export const oAuth = (service) => passport.authenticate(service, {session: false} );
