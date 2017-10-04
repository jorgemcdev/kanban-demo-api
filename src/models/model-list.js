/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define Board Schema
const listSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    _board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('List', listSchema);
