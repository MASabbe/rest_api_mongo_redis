import {createServer} from 'http';
import redis from './config/redis';
import {masterConnection, slaveConnection} from './config/mongoose';
import logger from './config/logger';
import {appName, appVersion, env, port} from './config/vars';
import app from './config/express';

let server;
if (env === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}
const mongoConnect = async () => {
  await masterConnection();
  await slaveConnection();
};
const mongoDisconnect = async () => {
  await masterConnection().close();
  await slaveConnection().close();
};
const redisConnect = async () => {
  await redis.connect();
};
const redisDisconnect = async () => {
  redis.isOpen ? await redis.quit() : await Promise.resolve();
};
const exitHandler = (err) => {
  if (server) {
    server.close();
  }
  logger.info('Server closed');
  if (err) {
    logger.error(err.message);
    process.exit(1);
  } else {
    process.exit(0);
  }
};
const gracefulShutdown = (err) => {
  logger.info('Shutting down gracefully.');
  return Promise.all([
    mongoDisconnect(),
    redisDisconnect(),
  ]).then(()=>{
    logger.info(`Database closed`);
  }).finally(()=>{
    exitHandler(err);
  });
};
Promise.all([
  mongoConnect(),
  redisConnect(),
]).then(()=>{
  server = createServer(app);
  server.listen(port);
  logger.info(`${appName.toUpperCase()} v${appVersion} server started on port ${port} (${env})`);
}).catch((err)=> setTimeout(()=>gracefulShutdown(err), 3000));

export default server;
