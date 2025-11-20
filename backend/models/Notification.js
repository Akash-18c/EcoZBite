const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'product_expiring',
      'new_discount',
      'order_confirmed',
      'order_ready',
      'order_expired',
      'recommendation',
      'system_update',
      'welcome'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    product_id: mongoose.Schema.Types.ObjectId,
    order_id: mongoose.Schema.Types.ObjectId,
    store_id: mongoose.Schema.Types.ObjectId,
    discount_percentage: Number,
    action_url: String,
    image_url: String
  },
  channels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    inApp: {
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledFor: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  metadata: {
    campaign_id: String,
    source: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'channels.inApp.read': 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);