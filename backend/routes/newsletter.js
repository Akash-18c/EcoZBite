const express = require('express');
const { sendWelcomeEmail } = require('../utils/emailService');
const router = express.Router();

// Newsletter subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Newsletter subscription request:', { email: email?.substring(0, 5) + '***' });
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }
    
    // Send welcome email
    const emailResult = await sendWelcomeEmail(email.trim());
    if (!emailResult.success) {
      console.error('❌ Welcome email failed:', emailResult.error);
      // Continue with success response even if email fails
    }
    
    // Log successful subscription
    console.log(`✅ Newsletter subscription successful: ${email?.substring(0, 5)}***`);
    
    // Return success response
    return res.status(200).json({ 
      success: true,
      message: emailResult.success ? 
        'Successfully subscribed to newsletter! Check your email for a welcome message.' : 
        'Successfully subscribed to newsletter!',
      email: email,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to subscribe. Please try again.' 
    });
  }
});

module.exports = router;