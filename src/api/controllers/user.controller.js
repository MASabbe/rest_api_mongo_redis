import User from '../models/user.model';
import {decodeHex} from '../../config/hashids';
import httpStatus from "http-status";
const load = async (req, res, next, id) => {
  try {
    const user = await User.profile(decodeHex(id));
    req.locals = {user};
    next();
  } catch (e) {
    next(e);
  }
};
const get = (req, res) => res.json(req.locals.user);
const profile = (req, res) => res.json(req.locals.user);
const update = async (req, res, next) => {
  try {

  } catch (e) {
    next(e);
  }
};
const replace = async (req, res, next) => {
  try {

  } catch (e) {
    next(e);
  }
};
const list = async (req, res, next) => {
  try {
    const data = await User.list(req.query);
    res.status(httpStatus.OK);
    res.json(data);
  } catch (e) {
    next(e);
  }
};
export default {
  load,
  get,
  update,
  replace,
  list,
  profile,
};
