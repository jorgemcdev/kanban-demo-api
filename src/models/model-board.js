/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define Board Schema
const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Board', boardSchema);
