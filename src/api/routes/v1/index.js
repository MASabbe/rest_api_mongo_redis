import express from 'express';
import * as path from 'path';
import authRoute from "./auth.route";
import userRoute from "./user.route";
const router = express.Router();
/**
 * @api {get} /status Request server health status
 * @apiName Status
 * @apiGroup Server Status
 *
 *
 * @apiSuccess {String} upTime Server uptime.
 * @apiSuccess {String} responseTime Server response time.
 * @apiSuccess {String} message Server status.
 * @apiSuccess {String} timestamp Server timestamp.
 */
router.get('/status', (req, res) => res.json({
  upTime: process.uptime(),
  responseTime: process.hrtime(),
  message: 'OK',
  timestamp: Date.now(),
}));
/**
 * GET v1/docs
 */
router.use('/docs', express.static(path.join(__dirname, '/../../../../public/docs/index.html')));
// public static files
router.use('/assets', express.static(path.join(__dirname, '/../../../../public/docs/assets')));
/**
 * APP
 **/
router.use('/auth', authRoute);
router.use('/users', userRoute);
export default router;
