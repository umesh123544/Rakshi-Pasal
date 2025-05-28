const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();
const mongoose = require('mongoose')
const User = require('./models/User')
// In-memory database (replace with real DB in production)
const usersDB = [];
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  // Run this once
// await User.collection.dropIndex('email_1');
console.log('MongoDB Connected')})
.catch(err => console.error(err));

// Initialize app

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api', require('./routes/api'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
const PORT = process.env.PORT || 10000;
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aailapasa.netlify.app'
  ],  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

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

    // Find user
    const user = usersDB.find(u => u.username === username.trim());
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
        id: user.id,
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

    // Check if user exists
    if (usersDB.some(u => u.email === email.trim())) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        timestamp: new Date()
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    // Save user
    usersDB.push(newUser);
    console.log('New user created:', newUser);

    // Response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
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
app.post('/forgot-password', (req, res) => {
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

    const userExists = usersDB.some(u => u.email === email.trim().toLowerCase());
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST /login`);
  console.log(`- POST /signup`);
  console.log(`- POST /forgot-password`);
  console.log(`- GET /health`);
});
