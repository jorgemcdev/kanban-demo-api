/* eslint no-console: 0 */
import mongoose from 'mongoose';
import config from 'config';
import logger from 'winston';

export default () => {
  // Use native promises
  mongoose.Promise = global.Promise;
  /*
  * Mongoose by default sets the auto_reconnect option to true.
  * We recommend setting socket options at both the server and replica set level.
  * We recommend a 30 second connection timeout because it allows for
  * plenty of time in most operating environments.
  */
  const options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
  };

    // Build the connection string
  const mongodbUri = process.env.PROD_MONGODB || config.DBHOST;

  mongoose.connect(mongodbUri, options);

  mongoose.connection.on('error', (err) => {
    logger.error(`connection error: ${err}`);
  });

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose default connection open');
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose default connection disconnected');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.error('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};
