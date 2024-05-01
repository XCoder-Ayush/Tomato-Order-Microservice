const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, require: true },
    quantity: { type: Number, require: true },
    subtotal: { type: Number, require: true },
  },
  { timestamps: true }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
