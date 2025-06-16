const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const validator = require('../validators/authValidator');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @route    POST /auth/google/callback
// @desc     Authenticate user with Google
// @access   Public
router.post('/google/callback', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: payload.email },
        { providerId: payload.sub }
      ]
    });
    
    // Create new user if doesn't exist
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: 'google',
        providerId: payload.sub,
        verified: payload.email_verified
      });
      await user.save();
    } else if (user.provider !== 'google') {
      // User exists but with different provider
      return res.status(400).json({ 
        success: false,
        message: `This email is already registered with ${user.provider} authentication`
      });
    }

    // Update last login
    await user.updateLastLogin();
    
    // Generate JWT
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route    POST /auth/facebook/callback
// @desc     Authenticate user with Facebook
// @access   Public
router.post('/facebook/callback', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Facebook token
    const appTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`
    );
    
    const debugResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appTokenResponse.data.access_token}`
    );
    
    if (debugResponse.data.data.app_id !== process.env.FACEBOOK_APP_ID) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid Facebook token'
      });
    }
    
    // Get user info
    const userInfoResponse = await axios.get(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.width(400)&access_token=${token}`
    );
    
    const userData = userInfoResponse.data;
    
    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: userData.email },
        { providerId: userData.id }
      ]
    });
    
    // Create new user if doesn't exist
    if (!user) {
      user = new User({
        name: userData.name,
        email: userData.email,
        avatar: userData.picture?.data?.url || 'default.jpg',
        provider: 'facebook',
        providerId: userData.id,
        verified: true
      });
      await user.save();
    } else if (user.provider !== 'facebook') {
      // User exists but with different provider
      return res.status(400).json({ 
        success: false,
        message: `This email is already registered with ${user.provider} authentication`
      });
    }

    // Update last login
    await user.updateLastLogin();
    
    // Generate JWT
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
