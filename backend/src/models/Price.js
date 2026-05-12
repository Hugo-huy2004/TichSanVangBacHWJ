const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Gold', 'Silver'], required: true },
    buy: { type: Number, required: true },
    sell: { type: Number, required: true },
    source: { type: String, enum: ['manual', 'api'], default: 'manual' },
    apiUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

priceSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);