# Email Troubleshooting Guide

## 🔧 Quick Fix Steps

### 1. Verify Email Configuration
Check your `.env` file in the backend directory:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ecozbite.verify@gmail.com
EMAIL_PASS=iexx lttd anbp tstx
EMAIL_FROM=EcoZBite <ecozbite.verify@gmail.com>
ADMIN_EMAIL=ecozbite.verify@gmail.com
```

### 2. Test Email Connection
Visit: `http://localhost:4000/api/test-email/connection`

Should return:
```json
{
  "success": true,
  "message": "Email connection successful"
}
```

### 3. Test Welcome Email
POST to: `http://localhost:4000/api/test-email/welcome`
```json
{
  "email": "your-test-email@gmail.com"
}
```

### 4. Test Contact Email
POST to: `http://localhost:4000/api/test-email/contact`
```json
{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "subject": "Test Subject",
  "message": "Test message"
}
```

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication failed"
**Solution**: 
1. Enable 2-factor authentication on Gmail
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Issue 2: "Connection timeout"
**Solution**:
1. Check firewall settings
2. Try different EMAIL_PORT (465 for SSL)
3. Set EMAIL_SECURE=true if using port 465

### Issue 3: "Email not received"
**Solution**:
1. Check spam/junk folder
2. Verify email address is correct
3. Check server logs for errors

## 📋 Testing Checklist

- [ ] Backend server is running on port 4000
- [ ] Email connection test passes
- [ ] Newsletter subscription works
- [ ] Contact form submission works
- [ ] Welcome email is received
- [ ] Contact confirmation email is received
- [ ] Admin notification email is received

## 🔍 Debug Commands

### Check server logs:
```bash
cd backend
npm start
```

Look for these log messages:
- ✅ Email server connection verified
- ✅ Welcome email sent successfully
- ✅ Contact notification sent successfully
- ✅ Contact confirmation sent successfully

### Manual email test:
```bash
# Test newsletter
curl -X POST http://localhost:4000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test contact form
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'
```

## 📧 Gmail Setup Instructions

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to App Passwords section
4. Generate new app password for "Mail"
5. Use this password in EMAIL_PASS

## 🔄 Restart Instructions

After making changes:
1. Stop the backend server (Ctrl+C)
2. Start it again: `npm start`
3. Check logs for email connection verification
4. Test the functionality

## 📞 Support

If emails are still not working:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test with a different email provider if needed
4. Check if the Gmail account has any restrictions