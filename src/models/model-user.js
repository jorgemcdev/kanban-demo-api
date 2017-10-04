/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint consistent-return: 0 */
/* eslint no-multi-assign: 0 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from 'config';

const SALT_WORK_FACTOR = config.SALT_WORK_FACTOR;
const MAX_LOGIN_ATTEMPTS = config.MAX_LOGIN_ATTEMPTS;
const LOCK_TIME = config.LOCK_TIME;

const Schema = mongoose.Schema;

// Define Board Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    lastname: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      enum: ['Member', 'Admin'],
      default: 'Member',
      required: true
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lockUntil: { type: Date }
  },
  {
    timestamps: true
  }
);

userSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', function (next) {
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // set the hashed password back on our user document
      user.password = hash;
      return next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.incLoginAttempts = function (cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }
  // otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
const reasons = userSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
};

userSchema.statics.getAuthenticated = function (username, password, cb) {
  this.findOne({ email: username }, function (err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) {
      return cb(null, null, reasons.NOT_FOUND);
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function (err) {
        if (err) return cb(err);
        return cb(null, null, reasons.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function (err, isMatch) {
      if (err) return cb(err);
      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        // reset attempts and lock info
        const updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        };
        return user.update(updates, function (err) {
          if (err) return cb(err);
          return cb(null, user);
        });
      }
      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function (err) {
        if (err) return cb(err);
        return cb(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
};

module.exports = mongoose.model('User', userSchema);
