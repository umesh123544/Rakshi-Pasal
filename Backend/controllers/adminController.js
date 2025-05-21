const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// USER CRUD OPERATIONS

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, first_name, last_name, password, is_admin } = req.body;
    
    const user = new User({
      username,
      email,
      first_name,
      last_name,
      password,
      is_admin: is_admin || false
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, first_name, last_name, is_admin } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, first_name, last_name, is_admin },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// PRODUCT CRUD OPERATIONS

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ORDER CRUD OPERATIONS

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'username email');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// CONTACT MESSAGE OPERATIONS

// Get all contact messages
exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ created_at: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};