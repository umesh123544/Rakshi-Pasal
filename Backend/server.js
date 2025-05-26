const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

// Temporary database (replace with real database in production)
let users = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve your HTML files

// Routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid password' });
  
  res.json({ success: true, message: 'Login successful' });
});

app.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    fullName,
    email,
    username: email, // Using email as username for simplicity
    password: hashedPassword
  };
  
  users.push(newUser);
  res.json({ success: true, message: 'Account created successfully' });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) return res.status(404).json({ success: false, message: 'Email not found' });
  
  // In real app: Send password reset email here
  res.json({ success: true, message: 'Reset link sent to your email' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));