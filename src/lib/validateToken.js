import jwt from 'jsonwebtoken';
import config from 'config';
import User from '../models/model-user';

export default (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  let token;
  if (authorizationHeader) token = authorizationHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ error: 'Your Session as Expire !' });
      } else {
        User.findOne({ _id: decoded.id }, (err, user) => {
          if (!user) {
            res.status(401).send({ error: 'Your Session is Not Valid' });
          } else {
            next();
          }
        });
      }
    });
  } else {
    res.status(401).send({ error: 'No token provided' });
  }
};
