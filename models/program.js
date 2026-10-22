const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  supersetCount: { type: Number, required: true, min: 0, max: 20 }
}, { timestamps: true });
module.exports = mongoose.model('Program', schema, 'Programs');
