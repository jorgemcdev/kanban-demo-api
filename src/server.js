import express from 'express';
import { Server } from 'http';
import SocketIo from 'socket.io';

import path from 'path';
import logger from 'winston';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';

// Load: Config + DB + Routes + Socket.io
import config from 'config';
import dbConnect from './lib/db';
import routes from './routes';
import socketEvents from './socket.io/socket-events';

const app = express();

const corsOptions = {
  'Access-Control-Allow-Credentials': true
};

app.use(cors(corsOptions));

/*
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);
*/

/* Socket.io */
const http = Server(app);
const io = new SocketIo(http);
socketEvents(io);

/* Configure Middleware */
app.use(expressValidator());

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));

/* Connect to the Database */
dbConnect();


/* API Routes */
const apiRouter = new express.Router(); // app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, '/public/uploads')));
app.use('/api', apiRouter);

routes(apiRouter);

/*  Home Route */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('not Found');
  err.status = 404;
  if (err.status === 404) {
    res.status(404).send({ error: err.message });
  } else {
    next(err);
  }
});

app.use((err, req, res) => {
  // Do logging and user-friendly error message display
  logger.error(err);
  res.status(500).send({ error: 'internal error' });
});

/* Start Server */
http.listen(process.env.PORT || 3001, (err) => {
  if (err) {
    logger.error('error', 'cant start server', { err });
  } else {
    logger.info('Server Started', {
      port: config.PORT,
      ENV: process.env.NODE_ENV
    });
  }
});

export default app;
