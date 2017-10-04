/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define Board Schema
const cardSchema = new Schema(
  {
    description: {
      type: String,
      required: true
    },
    sort: {
      type: Number,
      default: 0
    },
    _board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board'
    },
    _list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List'
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', cardSchema);
