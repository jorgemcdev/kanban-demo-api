import jwt from 'jsonwebtoken';
import fs from 'fs';
import multer from 'multer';
import { UPLOAD_PATH, CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from 'config';
import cloudinary from 'cloudinary';

import User from './../models/model-user';

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
});

/**
 * @desc list Users
 */
const getUsers = (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    if (users) {
      return res.status(200).send({ success: true, users });
    }
    return res.status(200).send({ success: true, message: 'Records not found' });
  });
};
/**
 * @desc Create New User
 */
const postUser = (req, res, next) => {
  const { name, lastname, avatar, password, email } = req.body;
  const data = new User({
    name,
    lastname,
    avatar,
    password,
    email
  });
  data.save((err, user) => {
    if (err) return next(err);
    return res.status(200).send({ success: true, user });
  });
};
/**
 * @desc List User
 */
const getUser = (req, res, next) => {
  const id = req.params.id;
  User.findById(id, { _id: 1, email: 1, name: 1, lastname: 1, avatar: 1 }, (err, user) => {
    if (err) return next(err);
    if (user) {
      return res.status(200).send({ success: true, user });
    }
    return res.status(403).send({ success: false, error: 'Record not found' });
  });
};
/**
 * @desc Update User
 */
const updateUser = (req, res, next) => {
  const id = req.params.id;
  const { name, lastname, avatar, email, password, role } = req.body;
  User.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      // NEW DATA
      const newData = Object.assign(data, {
        name: name || data.name,
        lastname: lastname || data.lastname,
        avatar: avatar || data.avatar,
        password: password || data.password,
        email: email || data.email,
        role: role || data.role
      });
       // SAVE DATA
      newData.save((err, user) => {
        if (err) next(err);
        return res.status(200).send({ success: true, user });
      });
    } else {
      return res.status(403).send({ success: false, error: 'Record not found' });
    }
    return true;
  });
};
/**
 * @desc Delete User
 */
const deleteUser = (req, res) => {
  const id = req.params.id;
  User.findByIdAndRemove(id, (err) => {
    if (err) {
      res.status(403).send({ success: false, error: 'Record not found' });
    }
    res.status(200).send({ success: true, message: 'Record deleted' });
  });
};

/**
 * @desc Upload Avatar
 */
const postUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  // Get User ID
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  User.findOneAndUpdate({ _id: decoded.id }, { $set: { avatar } }, (err, user) => {
    if (err) next(err);
    if (user) {
      res.status(200).send({ success: true, message: 'Record updated' });
    } else {
      res.status(403).send({ success: false, error: 'Record not found' });
    }
  });
};

const postUserUpload = (req, res, next) => {
  // Remove Pevious Image if exists
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  const id = decoded.id;
  User.findOne({ _id: id }, (err, data) => {
    if (data.avatar) {
      const ext = data.avatar.split('.');
      cloudinary.uploader.destroy(ext[2].split('/')[5], () => {
       // console.log(result);
      });
    }
  });
  // Upload Avatar to Temp Folder
  let myFileName = '';
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
      myFileName = `${Date.now()}`;
      cb(null, myFileName);
    }
  });
  const upload = multer({ storage }).single('file');
  upload(req, res, (err) => {
    if (err) next(err);
    // Upload to Cloudinary
    cloudinary.uploader.upload(
      `${UPLOAD_PATH}/${myFileName}`,
      (result) => {
        fs.unlink(`${UPLOAD_PATH}/${myFileName}`);
        res.status(200).send({ success: true, avatar: result.url });
      },
      {
        public_id: myFileName,
        crop: 'limit',
        width: 200,
        height: 200,
        tags: ['avatar']
      }
    );
  });
};

export default {
  getUsers, postUser, getUser, updateUser, deleteUser, postUserAvatar, postUserUpload
};
