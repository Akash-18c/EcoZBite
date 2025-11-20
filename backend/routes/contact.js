const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { auth, authorize } = require('../middleware/auth');
const { sendContactNotification, sendContactConfirmation } = require('../utils/emailService');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again later.'
  }
});

// Submit contact form
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Create contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await contactMessage.save();

    // Send emails
    const contactData = { name, email, subject, message };
    
    // Send notification to admin
    const adminEmailResult = await sendContactNotification(contactData);
    if (!adminEmailResult.success) {
      console.error('❌ Admin notification failed:', adminEmailResult.error);
    }
    
    // Send confirmation to user
    const userEmailResult = await sendContactConfirmation(contactData);
    if (!userEmailResult.success) {
      console.error('❌ User confirmation failed:', userEmailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you within 24-48 hours.',
      emailsSent: {
        adminNotification: adminEmailResult.success,
        userConfirmation: userEmailResult.success
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Get all contact messages (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// Update message status (Admin only)
router.patch('/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminNotes: adminNotes || undefined
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
});

// Delete message (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    });
  }
});

module.exports = router;