const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['google', 'zalo'], required: true },
    providerUserId: { type: String, required: true },
    displayName: { type: String, required: true },
    fullName: { type: String, default: '' },
    nickname: { type: String, default: '' },
    birthday: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

userSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);