// const ContactMessage = require('../models/Contact');
// const nodemailer = require('nodemailer');

// // Submit contact form
// exports.submitContactForm = async (req, res) => {
//   try {
//     const { name, email, subject, message } = req.body;
    
//     // Save contact message
//     const contactMessage = new ContactMessage({
//       name,
//       email,
//       subject,
//       message
//     });
    
//     await contactMessage.save();
    
//     // Send confirmation email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: `Contact Form Submission: ${subject}`,
//       text: `Thank you for contacting us, ${name}! We will get back to you soon.\n\nYour message:\n${message}`
//     };
    
//     await transporter.sendMail(mailOptions);
    
//     res.json({ status: 'success' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };
