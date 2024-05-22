import Hashids from 'hashids';
import {jwtSecret} from './vars';
const hashids = new Hashids(jwtSecret, 32);
/**
 * Replaces the IDs in an object recursively with the provided replace function.
 *
 * @param {object} obj - The object to replace the IDs in.
 * @param {function} replaceFunc - The function used to replace the IDs.
 * @return {object} The object with the IDs replaced.
 */
const replaceIds = (obj, replaceFunc) => {
  if (obj === null) return obj;
  for (const key of Object.keys(obj)) {
    if (obj[key] === null) continue;

    if (typeof obj[key] === 'object') {
      obj[key] = replaceIds(obj[key], replaceFunc);
    } else if (key === 'id' || (key.length >= 4 && key.endsWith('Id'))) {
      obj[key] = replaceFunc(obj[key]);
    }
  }
  return obj;
};
export const encode = (data) => {
  return hashids.encode(data);
};
export const decode = (data) => {
  return hashids.decode(data)[0];
};
export const encodeHex = (data) => {
  return hashids.encodeHex(data);
};
export const decodeHex = (data) => {
  return hashids.decodeHex(data)[0];
};
/**
 * Middleware function that encodes the response JSON object before sending it.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const encodeMiddleware = (req, res, next) => {
  const _json = res.json;
  res.json = (obj) => {
    res.json = _json;
    obj = replaceIds(obj, (v)=>encodeHex(v));
    return res.json(obj);
  };
  next();
};
/**
 * Middleware function to decode request query and body.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Function} The next function.
 */
export const decodeMiddleware = (req, res, next) => {
  try {
    req.query = replaceIds(req.query, (v) => decodeHex(v));
    req.body = replaceIds(req.body, (v) => decodeHex(v));
    return next();
  } catch (e) {
    return res.sendStatus(404);
  }
};
