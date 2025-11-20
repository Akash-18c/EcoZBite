const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  console.log('Creating email transporter with config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'Not set'
  });

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};

// Send welcome email for newsletter subscription
const sendWelcomeEmail = async (email) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EcoZBite <noreply@ecozbite.com>',
      to: email,
      subject: '🌱 Welcome to EcoZBite Newsletter - Start Your Sustainable Journey!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🌱 Welcome to EcoZBite!</h1>
            <p style="color: #E6FFFA; margin: 15px 0 0 0; font-size: 18px;">Your journey to sustainable living starts now</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 24px;">Thank you for joining our community! 🎉</h2>
            
            <p style="color: #4B5563; line-height: 1.6; font-size: 16px;">We're thrilled to have you on board! You've just taken an important step towards reducing food waste and saving money while protecting our planet.</p>
            
            <!-- Benefits Section -->
            <div style="background: #F0FDF4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10B981;">
              <h3 style="color: #065F46; margin-top: 0; font-size: 18px;">What you'll get:</h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">💰 Weekly deals and exclusive discounts</li>
                <li style="margin-bottom: 8px;">🍽️ Delicious recipes using discounted ingredients</li>
                <li style="margin-bottom: 8px;">🌍 Tips for reducing food waste at home</li>
                <li style="margin-bottom: 8px;">📊 Your personal impact tracking</li>
                <li style="margin-bottom: 8px;">🎯 Early access to new features</li>
              </ul>
            </div>
            
            <!-- CTA Section -->
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #1F2937; margin-bottom: 15px;">Ready to start saving?</h3>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                🛒 Start Shopping Now
              </a>
            </div>
            
            <!-- Stats Section -->
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #374151; text-align: center; margin-top: 0;">Join our impact community:</h3>
              <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
                <div style="margin: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10B981;">50K+</div>
                  <div style="font-size: 14px; color: #6B7280;">Products Saved</div>
                </div>
                <div style="margin: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10B981;">10K+</div>
                  <div style="font-size: 14px; color: #6B7280;">Happy Users</div>
                </div>
                <div style="margin: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10B981;">₹15Cr+</div>
                  <div style="font-size: 14px; color: #6B7280;">Money Saved</div>
                </div>
              </div>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px; text-align: center;">Questions? Reply to this email or contact us at <a href="mailto:support@ecozbite.com" style="color: #10B981;">support@ecozbite.com</a></p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #6B7280; font-size: 12px;">
            <p style="margin: 0;">EcoZBite - Save Food • Save Money • Save Planet 🌍</p>
            <p style="margin: 5px 0 0 0;">West Bengal, Barasat, India</p>
          </div>
        </div>
      `
    };

    console.log('Sending welcome email to:', email);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return { success: false, error: error.message };
  }
};

// Send contact form notification to admin
const sendContactNotification = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EcoZBite <noreply@ecozbite.com>',
      to: process.env.ADMIN_EMAIL || 'support@ecozbite.com',
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">New Contact Form Submission</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Contact Details</h3>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #333;">Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
          </div>
        </div>
      `
    };

    console.log('Sending contact notification to admin');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Contact notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Send contact form confirmation to user
const sendContactConfirmation = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EcoZBite <noreply@ecozbite.com>',
      to: contactData.email,
      subject: 'Thank you for contacting EcoZBite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Thank You!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We've received your message</p>
          </div>
          
          <div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hi ${contactData.name},</p>
            
            <p>Thank you for reaching out to EcoZBite! We've received your message and our support team will get back to you within 24-48 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Your Message Summary</h3>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>Best regards,<br>The EcoZBite Support Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                EcoZBite - Save Food, Save Money, Save Planet 🌱
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('Sending contact confirmation to user:', contactData.email);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact confirmation sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Contact confirmation failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  testEmailConnection,
  sendWelcomeEmail,
  sendContactNotification,
  sendContactConfirmation
};