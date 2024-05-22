import User from '../models/user.model';
import {decode} from '../../config/hashids';
const load = async (req, res, next, id) => {
  try {
    const user = await User.profile(decode(id));
    req.locals = {user};
    next();
  } catch (e) {
    next(e);
  }
};
const get = (req, res) => res.json(req.locals.user);
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

  } catch (e) {
    next(e);
  }
};
const profile = async (req, res, next) => {
  try {

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
