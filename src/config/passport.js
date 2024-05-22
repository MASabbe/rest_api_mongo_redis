import BearerStrategy from 'passport-http-bearer';
import {ExtractJwt, Strategy as JWTStrategy} from 'passport-jwt';
import {jwtSecret} from './vars';
import authProviders from '../api/services/authProviders';
import User from '../api/models/user.model';

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};
const oAuth = (service) => async (token, done) => {
  try {
    const userData = await authProviders[service](token);
    const user = await User.oAuthLogin(userData);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};
export const jwt = new JWTStrategy(jwtOptions, async (payload, done)=>{
  try {
    const user = await User.profile(payload.sub);
    if (user) {
      if (user.hasOwnProperty('banned') && !user.banned) {
        return done(null, user);
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
