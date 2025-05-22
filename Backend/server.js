require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/aailapasa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
  description: String,
  image: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,
  deliveryTime: String,
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  status: { type: String, default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
}));

// Image Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid credentials');

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key');
    res.header('Authorization', token).send({ token, role: user.role });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/api/products', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, stock, description, status } = req.body;
    const image = req.file ? req.file.filename : '';
    
    const product = new Product({
      name,
      category,
      price,
      stock,
      description,
      image,
      status
    });
    
    await product.save();
    res.status(201).send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put('/api/products/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = req.file.filename;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send('Product deleted');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Order Routes
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.send(orders);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).send('Order not found');
    res.send(order);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put('/api/orders/:id/status', authenticate, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    res.send(order);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
