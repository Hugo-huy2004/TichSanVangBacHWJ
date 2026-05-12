const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Zalo ID hoặc Google ID
  providerName: { type: String, required: true }, // SJC, PNJ, Mi Hồng...
  assetType: { type: String, enum: ['Gold', 'Silver'], required: true },
  purchaseDate: { type: Date, default: Date.now },
  purchasePrice: { type: Number, required: true }, // Giá lúc mua
  laborCost: { type: Number, default: 0 }, // Tiền công
  weight: { type: Number, required: true }, // Đơn vị: Chỉ
  note: String
});

module.exports = mongoose.model('Asset', assetSchema);