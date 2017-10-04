/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint eqeqeq: 0 */
import Card from './../models/model-card';

/**
 * @desc card Cards by List
 */
const getCards = (req, res, next) => {
  const _board = req.body._board;
  const query = Card.find({ _board },
  { description: 1, _list: 1, _board: 1, sort: 1 }).sort({ sort: 1 });
  query.exec((err, cards) => {
    if (err) return next(err);
    if (cards) {
      return res.status(200).send({ success: true, cards });
    }
    return res.status(200).send({ success: true, message: 'Record not found' });
  });
};

/**
 * @desc Create a Card
 */
const postCard = (req, res, next) => {
  const description = req.body.description;
  const _list = req.body._list;
  const _board = req.body._board;
  let maxSort = 1;
  // Find Max from Card List
  const query = Card.find({ _list }, { sort: 1 }).sort({ sort: -1 }).limit(1);
  query.exec((err, data) => {
    if (err) next(err);

    if (data.length) {
      maxSort = parseInt(data[0].sort, 10) + 1;
    }

    const newCard = new Card({
      description,
      _list,
      _board,
      sort: maxSort.toString()
    });
    // Save the Card
    newCard.save((err, card) => {
      if (err) return next(err);
      return res.status(200).send({ success: true, card });
    });
    return true;
  });
};
/**
 * @desc List Card by Id
 */
const getCard = (req, res, next) => {
  const id = req.params.id;
  Card.findOne({ _id: id }, { description: 1, _list: 1 }, (err, card) => {
    if (err) return next(err);
    if (card) {
      return res.status(200).send({ success: true, card });
    }
    return res.status(403).send({ success: false, error: 'Record not found' });
  });
};
/**
 * @desc Update Card
 */
const updateCard = (req, res, next) => {
  const id = req.params.id;
  const description = req.body.description;
  Card.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const newData = Object.assign(data, {
        description: description || data.description,
        _list: data._list,
        _board: data._board
      });
      newData.save({ _id: id }, (err, card) => {
        if (err) next(err);
        return res.status(200).send({ success: true, card });
      });
    } else {
      return res.status(403).send({ success: false, error: 'Record not found' });
    }
    return true;
  });
};

/**
 * @desc Update Card Change List
 */
const changeCardList = (req, res, next) => {
  const id = req.params.id;
  const listId = req.body.listId;
  Card.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const newData = Object.assign(data, {
        description: data.description,
        _list: listId
      });
      newData.save({ _id: id }, (err, card) => {
        if (err) next(err);
        return res.status(200).send({ success: true, card });
      });
    } else {
      return res.status(403).send({ success: false, error: 'Record not found' });
    }
    return true;
  });
};
/**
 * @desc Delete Card
 */
const deleteCard = (req, res, next) => {
  const id = req.params.id;
  Card.findOne({ _id: id }, (err, data) => {
    if (err) next(err);
    if (data) {
      const _board = data._board;
      Card.remove({ _id: id }, (err) => {
        if (err) next(err);
        return res.status(200).send({ success: true, message: 'Record deleted', _board });
      });
    } else {
      return res.status(403).send({ sucess: false, error: 'Record not found' });
    }
    return true;
  });
};


/**
 * @desc Update Card Move
 */
const postCardMove = (req, res, next) => {
  const boardId = req.body.boardId;
  const sourceId = req.body.sourceId;
  const targetId = req.body.targetId;
  // const sourceListId = req.body.sourceListId;
  const targetListId = req.body.targetListId;

  const query = Card.find({ _board: boardId },
  { _id: 1, _list: 1, description: 1, _board: 1, sort: 1 }).sort({ sort: 1 });
  query.exec(function (err, cards) {
    if (err) next(err);
    if (cards) {
      const sourceIndex = cards.findIndex(item => item._id == sourceId);
      const sourceArray = cards.filter(item => item._id == sourceId);

      const targetIndex = cards.findIndex(item => item._id == targetId);

      // get rid of the source
      cards.splice(sourceIndex, 1);

      // Update the target List
      sourceArray[0]._list = targetListId;

      // Add the Moved Array
      cards.splice(targetIndex, 0, sourceArray[0]);

      // Filter cards from target List
      const targetList = cards.filter(item => item._list == targetListId);

      // Sort the cards
      targetList.map((item, index) => {
        Card.update({ _id: item._id }, { $set: {
          sort: index, _list: item._list }
        }, { upsert: false }, function (err) {
          if (err) next(err);
        });
        return true;
      });
    }
    return true;
  });
  res.status(200).send({ success: 'true' });
};
// https://survivejs.com/react/implementing-kanban/drag-and-drop/
/**
 * @desc Atach Card to Empty List
 */
const postCardAtach = (req, res, next) => {
  // get Params
  const boardId = req.body.boardId;
  const sourceId = req.body.sourceId;
  const targetListId = req.body.targetListId;

  // Find All Board Cards
  const query = Card.find({ _board: boardId },
  { _id: 1, _list: 1, _board: 1, sort: 1 }).sort({ sort: 1 });

  query.exec(function (err, data) {
    if (err) next(err);

    if (data) {
      // Add Card to Empty List
      Card.update({ _id: sourceId }, { $set: {
        sort: 0, _list: targetListId }
      }, { upsert: false }, function (err) {
        if (err) next(err);
      });
    }
    return true;
  });
  res.status(200).send({ success: 'true' });
};

export default {
  getCards, postCard, getCard, updateCard, deleteCard, changeCardList, postCardMove, postCardAtach
};
