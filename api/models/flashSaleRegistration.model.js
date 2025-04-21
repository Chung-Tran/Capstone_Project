const mongoose = require('mongoose');

const flashSaleRegistrationSchema = new mongoose.Schema({
  flash_sale_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  discount: { type: Number, required: true, min: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('FlashSaleRegistration', flashSaleRegistrationSchema);