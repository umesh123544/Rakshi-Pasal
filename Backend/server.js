const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aailapasa.netlify.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', require('./routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Login endpoint
app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        timestamp: new Date()
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date()
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date()
      });
    }

    // Successful login
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    });
  }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  console.log('Signup attempt:', req.body);
  try {
    const { fullName, email, password } = req.body;
    
    // Validation
    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        timestamp: new Date()
      });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
        timestamp: new Date()
      });
    }

    // Check if user exists in MongoDB
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        timestamp: new Date()
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: email.trim().toLowerCase(),
      password: hashedPassword
    });

    // Save user to MongoDB
    await newUser.save();
    console.log('New user created:', newUser);

    // Response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    });
  }
});

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  console.log('Password reset request:', req.body);
  try {
    const { email } = req.body;
    
    if (!email?.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
        timestamp: new Date()
      });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
        timestamp: new Date()
      });
    }

    // In production: Send actual reset email here
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST /login`);
  console.log(`- POST /signup`);
  console.log(`- POST /forgot-password`);
  console.log(`- GET /health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});