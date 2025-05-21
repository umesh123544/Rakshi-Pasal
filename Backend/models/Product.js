const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['whiskey', 'wine', 'beer', 'vodka', 'cigarette']
  },
  description: { type: String },
  price: { type: Number, required: true },
  image_url: { type: String },
  volume: { type: String },
  is_best_seller: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;