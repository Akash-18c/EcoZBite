const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// @route   GET /api/admin/customers
// @desc    Get all customers with order count
// @access  Private (Admin only)
router.get('/customers', auth, authorize(['admin']), async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get order count for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        return {
          ...customer.toObject(),
          totalOrders: orderCount
        };
      })
    );
    
    res.json({
      success: true,
      customers: customersWithStats
    });
    
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching customers' 
    });
  }
});

// @route   PUT /api/admin/customers/:id/toggle-status
// @desc    Toggle customer active status
// @access  Private (Admin only)
router.put('/customers/:id/toggle-status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    
    customer.isActive = isActive;
    await customer.save();
    
    res.json({
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive
      }
    });
    
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating customer status' 
    });
  }
});

module.exports = router;