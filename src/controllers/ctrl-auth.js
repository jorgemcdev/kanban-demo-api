/* eslint prefer-template: 0 */

import config from 'config';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import mailgun from '../lib/mailgun';
import User from '../models/model-user';

// Generate JWT, TO-DO Add issuer and audience
const generateToken = user => (
  jwt.sign(user, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES })
);

// Set user info from request
const setUserInfo = (request) => {
  const userInfo = {
    id: request._id,
    name: request.name,
    avatar: request.avatar,
    role: request.role
  };
  return userInfo;
};

const signupUser = (req, res, next) => {
  const name = req.body.name;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const passconf = req.body.passconf;

  if (passconf !== password) {
    return res.status(403).send({ success: false, error: 'Wrong details' });
  }

  const query = User.findOne({ email });
  query.exec((err, user) => {
    if (err) return next(err);
    if (user) {
      return res.status(403).send({ success: false, error: 'User already exists' });
    }
    const newUser = new User({
      name,
      lastname,
      email,
      password
    });
    newUser.save((err) => {
      if (err) return next(err);
      return res.status(200).send({ success: true, message: 'New user created' });
    });
    return true;
  });
  return true;
};

const userExists = (req, res, next) => {
  const email = req.body.email;
  const query = User.findOne({ email });
  query.exec((err, user) => {
    if (err) return next(err);
    if (user) {
      return res.status(200).send({ success: true });
    }
    return res.status(200).send({ success: false });
  });
};

const loginUser = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // attempt to authenticate user
  User.getAuthenticated(email, password, (err, user, reason) => {
    if (err) return next(err);
    // login was successful if we have a user
    if (user) {
      // handle login success
      const userInfo = setUserInfo(user);
      const token = generateToken(userInfo);
      return res.status(200).send({ success: false, message: 'Login Success', token });
    }
    // otherwise we can determine why we failed
    const reasons = User.failedLogin;
    switch (reason) {
      case reasons.NOT_FOUND:
        res.status(401).send({ success: false, error: 'Not found' });
        break;
      case reasons.PASSWORD_INCORRECT:
        // note: these cases are usually treated the same - don't tell
        // the user *why* the login failed, only that it did
        res.status(401).send({ success: false, error: 'Incorrect details' });
        break;
      case reasons.MAX_ATTEMPTS:
        // send email or otherwise notify user that account is
        // temporarily locked
        res.status(401).send({ success: false, error: 'Account locked' });
        break;
      default:
        res.status(401).send({ success: false, error: 'Default error' });
        break;
    }
    return true;
  });
};

const changePassword = (req, res, next) => {
  // Validate
  req.checkBody('email', 'Invalid username').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').len(3, 20);
  req.checkBody('newpassword', 'Invalid new password').len(3, 20);

  // Sanitize
  req.sanitize('password').escape();
  req.sanitize('newpassword').escape();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({ success: false, errors });
  }
  const { email, password, newpassword } = req.body;

  User.getAuthenticated(email, password, (err, user) => {
    if (err) return next(err);
    if (user) {
      const data = Object.assign(user, { password: newpassword });
      data.save((err) => {
        if (err) return next(err);
        return res.status(200).send({ success: true, message: 'Password changed' });
      });
    } else {
      res.status(401).send({ success: false, error: 'Incorrect details' });
    }
    return true;
  });
  return true;
};

const refreshToken = (req, res, next) => {
  // Get the Token
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader.split(' ')[1];
  // Verify Token
  jwt.verify(token, config.JWT_SECRET, (err) => {
    if (err) next(err);
    res.status(200).send(token);
  });
};

const requestPassword = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(422).send({
        error: 'Your username / email is not in our database.'
      });
    }
    crypto.randomBytes(48, (err, buffer) => {
      if (err) return next(err);
      const resetToken = buffer.toString('hex');
      const existingUser = Object.assign(user, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + config.RESET_TOKEN_EXPIRES
      });
      existingUser.save((err, data) => {
        if (err) return next(err);
        if (data) {
          const message = {
            subject: 'Reset Password',
            text: 'You are receiving this because you (or someone else) have requested the reset' +
            ' of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + config.CLIENT_HOST + '/password-reset/' + resetToken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          // Otherwise, send user email via Mailgun
          const email = existingUser.email || existingUser.name;
          mailgun.sendEmail(email, message);
          return res.status(200).send({ message: 'Please check your email for the link to reset your password.' });
        }
        return true;
      });
      return true;
    });
    return true;
  });
};


const resetPassword = (req, res, next) => {
  // Validate
  req.checkBody('token', 'Invalid Token').notEmpty();
  req.checkBody('password', 'Invalid password').len(6, 20);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(422).send({ errors });
  }
  // sanitize
  req.sanitize('token').escape();
  req.sanitize('password').escape();

  const token = req.body.token;
  const password = req.body.password;
  User.findOne({
    resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err) {
      next();
    }
    if (!user) {
      return res.status(401).send({
        error: 'Your token has expired. Please attempt to reset your password again.'
      });
    }
    const newData = Object.assign(user, {
      password,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });
    newData.save({ _id: user.id }, (err) => {
      if (err) return next(err);
      const message = {
        subject: 'Password Changed',
        text: 'You are receiving this email because you changed your password. \n\n' +
        'If you did not request this change, please contact us immediately.'
      };
      // Otherwise, send user email confirmation of password change via Mailgun
      const email = newData.email || newData.userName;
      mailgun.sendEmail(email, message);
      return res.status(200).send({
        message: 'Password changed successfully. Please login with your new password.'
      });
    });
    return true;
  });
  return true;
};

export default {
  signupUser, userExists, loginUser, refreshToken, changePassword, requestPassword, resetPassword
};
