const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  order_number: { type: String },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  delivery_option: { 
    type: String, 
    enum: ['ring_road', 'outside_ring_road'] 
  },
  delivery_time: { 
    type: String, 
    enum: ['ASAP', 'morning', 'afternoon', 'evening'] 
  },
  special_instructions: { type: String },
  subtotal: { type: Number, default: 0 },
  delivery_fee: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const orderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  total_price: { type: Number, required: true }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
