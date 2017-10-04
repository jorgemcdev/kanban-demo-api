import logger from 'winston';
import socketioJwt from 'socketio-jwt';
import config from 'config';

export default (io) => {
  io
  .on('connection', socketioJwt.authorize({
    secret: config.JWT_SECRET,
    timeout: 15000 // 15 seconds to send the authentication message
  }))

  .on('authenticated', (socket) => {
    // Wellcome Authenticated User
    logger.info(`hello! ${socket.decoded_token.name}`);

    //  BOARD CRUD Events
    socket.on('board', (message) => {
      logger.info(message);
      socket.broadcast.emit('board', message);
    });

    //  LISTS / CARDS CRUD Events
    socket.on('list', (message) => {
      logger.info(message);
      socket.broadcast.emit('list', message);
    });

    // User Disconnect
    socket.on('disconnect', (socket) => {
      logger.info('User Disconnected ', socket);
    });
  });
};

// https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/
// https://auth0.com/blog/auth-with-socket-io/
// https://github.com/auth0/socketio-jwt
