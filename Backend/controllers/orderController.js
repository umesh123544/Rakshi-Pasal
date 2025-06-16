// const Order = require('../models/Order');
// const Product = require('../models/Product');
// const User = require('../models/User');
// const nodemailer = require('nodemailer');
// const { validationResult } = require('express-validator');

// // Create order
// exports.createOrder = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { items, delivery_option, delivery_time, special_instructions } = req.body;
    
//     // Generate order number
//     const order_number = 'AP-' + Math.floor(100000 + Math.random() * 900000);
    
//     // Calculate totals
//     let subtotal = 0;
//     for (const item of items) {
//       const product = await Product.findById(item.product);
//       subtotal += product.price * item.quantity;
//     }
    
//     const delivery_fee = delivery_option === 'ring_road' ? 100 : 200;
//     const total = subtotal + delivery_fee;
    
//     // Create order
//     const order = new Order({
//       order_number,
//       customer: req.user.id,
//       items,
//       delivery_option,
//       delivery_time,
//       special_instructions,
//       subtotal,
//       delivery_fee,
//       total,
//       status: 'pending'
//     });
    
//     await order.save();
    
//     // Send confirmation email
//     await this.sendConfirmationEmail(order);
    
//     res.status(201).json(order);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Send confirmation email
// exports.sendConfirmationEmail = async (order) => {
//   try {
//     const user = await User.findById(order.customer);
    
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: `Order Confirmation - ${order.order_number}`,
//       text: `
//         Thank you for your order, ${user.first_name}!
        
//         Order Number: ${order.order_number}
//         Order Total: Rs.${order.total}
//         Delivery Address: ${user.customer_address}
//         Delivery Time: ${order.delivery_time}
        
//         Your order will be delivered within ${this.getDeliveryTimeEstimate(order)}.
//       `
//     };
    
//     await transporter.sendMail(mailOptions);
//   } catch (err) {
//     console.error('Error sending email:', err.message);
//   }
// };

// // Get delivery time estimate
// exports.getDeliveryTimeEstimate = (order) => {
//   return order.delivery_option === 'ring_road' ? '1 hour' : '2-3 hours';
// };
