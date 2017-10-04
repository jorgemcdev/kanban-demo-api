import jwt from 'jsonwebtoken';
import Board from './../models/model-board';
import List from './../models/model-list';

// list Boards
const getBoards = (req, res, next) => {
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  const query = Board.find({ _user: decoded.id }, { name: 1, _user: 1 });
  query.exec((err, boards) => {
    if (err) return next(err);
    if (boards) {
      return res.status(200).send({ success: true, boards });
    }
    return res.status(200).send({ success: true, message: 'Records not found' });
  });
};

// Create New Board
const postBoard = (req, res, next) => {
  const name = req.body.name;
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  const data = new Board({
    name,
    _user: decoded.id
  });
  data.save((err, board) => {
    if (err) return next(err);
    return res.status(200).send({ success: true, board });
  });
};

// List Board
const getBoard = (req, res, next) => {
  const id = req.params.id;
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  Board.find({ _id: id, _user: decoded._id }, { name: 1, _user: 1 }, (err, board) => {
    if (err) return next(err);
    if (board) {
      return res.status(200).send({ success: true, board });
    }
    return res.status(403).send({ success: false, error: 'Record not found' });
  });
};

// Update Board
const updateBoard = (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  Board.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const newData = Object.assign(data, {
        name: name || data.name,
        _user: data._user
      });
      newData.save({ _id: id }, (err, board) => {
        if (err) next(err);
        return res.status(200).send({ success: true, board });
      });
    } else {
      return res.status(403).send({ success: false, error: 'Record not found' });
    }
    return true;
  });
};

// Delete User
const deleteBoard = (req, res, next) => {
  const id = req.params.id;
  const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
  const _user = decoded.id;
  // Check if Board has Lists ?
  List.find({ _board: id }, (err, data) => {
    if (err) next(err);
    if (data.length === 0) {
      // Delete Board
      Board.find({ _id: id, _user }, (err, data) => {
        if (err) next(err);
        if (data) {
          Board.remove({ _id: id }, (err) => {
            if (err) next(err);
            return res.status(200).send({ success: true, message: 'Record deleted', _user });
          });
        } else {
          return res.status(403).send({ sucess: false, error: 'Record not found' });
        }
        return true;
      });
    } else {
      return res.status(403).send({ sucess: false, error: 'Cant Delete This Board, Is not Empty !' });
    }
    return true;
  });
};

export default {
  getBoards, postBoard, getBoard, updateBoard, deleteBoard
};
