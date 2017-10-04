import List from './../models/model-list';
import Card from './../models/model-card';
/**
 * @desc list Lists
 */
const getLists = (req, res, next) => {
  const _board = req.body._board;
  const query = List.find({ _board }, { name: 1, _board: 1 });
  query.exec((err, lists) => {
    if (err) return next(err);
    if (lists) {
      return res.status(200).send({ success: true, lists });
    }
    return res.status(200).send({ success: true, message: 'Record not found' });
  });
};
/**
 * @desc Create a List
 */
const postList = (req, res, next) => {
  const name = req.body.name;
  const _board = req.body._board;
  const data = new List({
    name,
    _board
  });
  data.save((err, list) => {
    if (err) return next(err);
    return res.status(200).send({ success: true, list });
  });
};
/**
 * @desc List by Id
 */
const getList = (req, res, next) => {
  const id = req.params.id;
  List.findOne({ _id: id }, (err, list) => {
    if (err) return next(err);
    if (list) {
      return res.status(200).send({ success: true, list });
    }
    return res.status(403).send({ success: false, error: 'Record not found' });
  });
};
/**
 * @desc Update List
 */
const updateList = (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  List.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const newData = Object.assign(data, {
        name: name || data.name
      });
      newData.save({ _id: id }, (err, list) => {
        if (err) next(err);
        return res.status(200).send({ success: true, list });
      });
    } else {
      return res.status(403).send({ success: false, error: 'Record not found' });
    }
    return true;
  });
};
/**
 * @desc Delete List
 */
const deleteList = (req, res, next) => {
  const id = req.params.id;
  List.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const _board = data._board;
      List.remove({ _id: id }, (err, data) => {
        if (err) next(err);
        if (data) {
          Card.remove({ _list: id }, (err) => {
            if (err) next(err);
            return res.status(200).send({ success: true, message: 'Records deleted', _board });
          });
        }
      });
    } else {
      return res.status(403).send({ sucess: false, error: 'Record not found' });
    }
    return true;
  });
};

export default {
  getLists, postList, getList, updateList, deleteList
};
