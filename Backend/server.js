const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aailapasa.netlify.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey123";

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Signup
app.post('/signup', async (req, res) => {
  console.log('Signup attempt:', req.body);
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: 'All fields are required', timestamp: new Date() });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters', timestamp: new Date() });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered', timestamp: new Date() });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: email.trim().toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();
    console.log('New user created:', newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date() });
  }
});

// Login
app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: 'Email and password are required', timestamp: new Date() });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials', timestamp: new Date() });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return res.status(401).json({ success: false, message: 'Invalid credentials', timestamp: new Date() });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date() });
  }
});

// Middleware for protected routes
function authMiddleware(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid token" });
  }
}

// Protected dashboard route
app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Welcome to dashboard!", user: req.user });
});

// Forgot password (mock)
app.post('/forgot-password', async (req, res) => {
  console.log('Password reset request:', req.body);
  try {
    const { email } = req.body;

    if (!email?.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required', timestamp: new Date() });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'Email not found', timestamp: new Date() });
    }

    res.json({ success: true, message: 'Password reset link sent to your email', timestamp: new Date() });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date() });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints: POST /signup, POST /login, POST /forgot-password, GET /dashboard, GET /health');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => { console.log('Server closed.'); process.exit(0); });
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});
