import dotenv from 'dotenv';
dotenv.config();
export const env = process.env.NODE_ENV || process.env.BABEL_ENV;
export const port = env === 'production'? process.env.PORT : 3001;
export const appName = process.env.APP_NAME;
export const appVersion = Number(process.env.APP_VERSION);
export const jwtSecret = process.env.APP_JWT_SECRET;
export const jwtExpirationInterval = env === 'production' ? process.env.APP_JWT_EXPIRATION_MINUTES : 180;
export const logs = env === 'production' ? 'combined' : 'dev';
export const redisConfig = {
  'host': process.env.REDIS_DB_HOST,
  'pass': process.env.REDIS_DB_PASS,
  'db': process.env.REDIS_DB_DATABASE,
};
export const mongolConfig = {
  'masterHost': process.env.MONGO_MASTER_HOST,
  'slaveHost': process.env.MONGO_SLAVE_HOST,
  'db': process.env.MONGO_DATABASE,
};
export const passwordShakti = process.env.APP_PASSWORD_SAKTI;
