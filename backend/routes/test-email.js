const express = require('express');
const { testEmailConnection, sendWelcomeEmail, sendContactNotification } = require('../utils/emailService');
const router = express.Router();

// Test email connection
router.get('/connection', async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    res.json({ 
      success: isConnected, 
      message: isConnected ? 'Email connection successful' : 'Email connection failed' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const result = await sendWelcomeEmail(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test contact notification
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const result = await sendContactNotification({ name, email, subject, message });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;