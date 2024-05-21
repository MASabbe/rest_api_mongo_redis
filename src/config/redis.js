import {createClient} from 'redis';
import {redisConfig} from './vars';
import logger from './logger';

const client = createClient({
  password: redisConfig.pass.toString(),
  socket: {
    host: redisConfig.host.toString(),
    port: '6379',
  },
  database: Number(redisConfig.db),
});
client.on('ready', ()=>{
  logger.info(`'redisDB connected to ${redisConfig.host} database ${redisConfig.db}`);
});
client.on('end', ()=>{
  logger.info(`closed`);
});
client.on('error', (err)=>{
  logger.error(err.message);
});
export default client;
