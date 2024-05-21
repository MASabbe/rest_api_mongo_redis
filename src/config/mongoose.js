import mongoose from 'mongoose';
import logger from './logger';
import {env, mongolConfig} from './vars';

const {masterHost, slaveHost, db} = mongolConfig;
// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});
mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('open', () => console.log('open'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('reconnected', () => console.log('reconnected'));
mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
mongoose.connection.on('close', () => console.log('close'));

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}
/**
 * Connect to the MongoDB database and return the connection object.
 *
 * @return {Object} The MongoDB connection object
 */
const connect = (host) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(host, {
      autoIndex: true,
      dbName: db,
    }).then((v)=>{
      const {host, name} = v.connection;
      logger.info(`mongo connected to database: ${host} ( ${name} )`);
      resolve(v);
    }).catch(reject);
  });
};
export const masterConnection = async ()=>{
  return await connect(masterHost);
};
export const slaveConnection = async ()=> {
  return await connect(slaveHost);
};
