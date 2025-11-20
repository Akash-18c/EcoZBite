const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const storeRoutes = require('./routes/stores');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const newsletterRoutes = require('./routes/newsletter');
const locationsRoutes = require('./routes/locations');
const userStatsRoutes = require('./routes/userStats');
const adminStatsRoutes = require('./routes/adminStats');
const contactRoutes = require('./routes/contact');
const wishlistRoutes = require('./routes/wishlist');
const recommendationRoutes = require('./routes/recommendations');
const { checkExpiringProducts } = require('./utils/cronJobs');
const { testEmailConnection } = require('./utils/emailService');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Initialize services
connectDB();
// initializeFirebase(); // Temporarily disabled due to config issues

// Test email connection on startup
testEmailConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics', userStatsRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/admin', require('./routes/adminCustomers'));
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/test-email', require('./routes/test-email'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Cron job - Check expiring products daily at 6 AM
cron.schedule('0 6 * * *', () => {
  console.log('🔄 Running daily expiry check...');
  checkExpiringProducts();
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;