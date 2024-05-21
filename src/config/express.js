import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import {jwt, facebook, google} from './passport';
import {encodeMiddleware, decodeMiddleware} from './hashids';
import {logs} from './vars';
import error from '../api/middlewares/error';
import routes from '../api/routes/v1/index';

const app = express();
// request logging. dev: console | production: file
app.use(morgan(logs));
// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// gzip compression
app.use(compress());
// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable HASHIDS
app.use(encodeMiddleware);
app.use(decodeMiddleware);
// enable CORS - Cross Origin Resource Sharing
app.use(cors());
// enable authentication
app.use(passport.initialize());
passport.use('jwt', jwt);
passport.use('facebook', facebook);
passport.use('google', google);
// favicon apps
// mount api v1 events
app.use('/v1', routes);
// if error is not an instanceOf ApiError, convert it.
app.use(error.converter);
// catch 404 and forward to error handler
app.use(error.notFound);
// error handler, send stacktrace only during development
app.use(error.handler);
export default app;
