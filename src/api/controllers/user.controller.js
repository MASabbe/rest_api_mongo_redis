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

export default {
  load,
};
