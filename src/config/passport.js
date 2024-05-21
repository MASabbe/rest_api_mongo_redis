import BearerStrategy from 'passport-http-bearer';
import {ExtractJwt, Strategy as JWTStrategy} from 'passport-jwt';
import {jwtSecret} from './vars';
import authProviders from '../api/services/authProviders';
import userModel from '../api/models/user.model';

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};
const oAuth = (service) => async (token, done) => {
  try {
    const userData = await authProviders[service](token);
    const user = await userModel.oAuthLogin(userData);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};
export const jwt = new JWTStrategy(jwtOptions, async (payload, done)=>{
  try {
    const user = await userModel.profile(payload.sub);
    if (user) {
      if (user.hasOwnProperty('banned') && Number(user.banned) === 0) {
        return done(null, {shakti: payload.shakti, su: payload.su, ...user});
      }
      return done(new Error('User is banned'), false);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});
export const facebook = new BearerStrategy(oAuth('facebook'));
export const google = new BearerStrategy(oAuth('google'));
