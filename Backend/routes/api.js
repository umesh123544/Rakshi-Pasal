const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAuthenticatedOrReadOnly = require('../middleware/isAuthenticatedOrReadOnly');
const { check } = require('express-validator');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');

// Auth routes
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

router.get('/user', auth, authController.getUser);

// Product routes
router.get('/products', isAuthenticatedOrReadOnly, productController.getAllProducts);
router.get('/products/categories', isAuthenticatedOrReadOnly, productController.getCategories);
router.get('/products/category/:category', isAuthenticatedOrReadOnly, productController.getProductsByCategory);
router.get('/products/search', isAuthenticatedOrReadOnly, productController.searchProducts);

// Order routes
router.post(
  '/orders',
  [
    auth,
    check('items', 'Items are required').not().isEmpty(),
    check('delivery_option', 'Delivery option is required').not().isEmpty(),
    check('delivery_time', 'Delivery time is required').not().isEmpty()
  ],
  orderController.createOrder
);

// Contact routes
router.post(
  '/contact',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty()
  ],
  contactController.submitContactForm
);

module.exports = router;