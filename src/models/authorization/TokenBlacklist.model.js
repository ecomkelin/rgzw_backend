/**
 * 解决 JWT 无法主动作废的痛点（JWT 本身是无状态的，一旦签发无法撤回，只能靠黑名单拦截）。
 */
const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TokenBlacklist', docSchema); 