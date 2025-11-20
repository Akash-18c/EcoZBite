const express = require('express');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { auth, authorize } = require('../middleware/auth');
const { cleanupOrphanedProducts } = require('../middleware/cleanup');
const multer = require('multer');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for CSV uploads
const csvUpload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.includes('csv') || file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel');
    
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Get all products with filters (customers see all stores' products)
router.get('/', cleanupOrphanedProducts, async (req, res) => {
  try {
    const { category, minPrice, maxPrice, expiryDays, search, page = 1, limit = 10, storeId } = req.query;
    
    let query = { status: 'active', stock: { $gt: 0 } };
    
    if (storeId) query.store = storeId;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.$or = [
        { discountedPrice: { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || 999999 } },
        { originalPrice: { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || 999999 } }
      ];
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (expiryDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Number(expiryDays));
      query.expiryDate = { $lte: futureDate };
    }

    const products = await Product.find(query)
      .populate({
        path: 'store',
        select: 'name address contact isActive',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out products with deleted/inactive stores
    const validProducts = products.filter(product => product.store);

    res.json({
      products: validProducts,
      totalPages: Math.ceil(validProducts.length / limit),
      currentPage: page,
      total: validProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store's own products (for store owners and admins)
router.get('/my-products', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    let store;
    
    if (req.user.role === 'admin' && req.user.store_id) {
      store = await Store.findById(req.user.store_id);
    } else {
      store = await Store.findOne({ owner: req.user.id });
    }
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found. Please create a store first.' });
    }

    let query = { store: store._id };
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('store', 'name address contact')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Get additional stats
    const [activeCount, lowStockCount, expiringCount] = await Promise.all([
      Product.countDocuments({ store: store._id, status: 'active', stock: { $gt: 0 } }),
      Product.countDocuments({ store: store._id, stock: { $lte: 5 } }),
      Product.countDocuments({ 
        store: store._id, 
        expiryDate: { $lte: new Date(Date.now() + 2*24*60*60*1000) },
        status: 'active'
      })
    ]);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: {
        activeProducts: activeCount,
        lowStockProducts: lowStockCount,
        expiringProducts: expiringCount
      },
      store: {
        id: store._id,
        name: store.name,
        address: store.address
      }
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get price comparison for similar products across stores
router.get('/:id/price-comparison', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find similar products by name or category
    const similarProducts = await Product.find({
      $or: [
        { name: { $regex: product.name, $options: 'i' } },
        { category: product.category }
      ],
      status: 'active',
      stock: { $gt: 0 }
    }).populate('store', 'name address contact');

    // Format data for price comparison
    const priceComparison = similarProducts.map(p => ({
      storeId: p.store._id,
      storeName: p.store.name,
      storeAddress: `${p.store.address.city}, ${p.store.address.state}`,
      storePhone: p.store.contact.phone,
      productId: p._id,
      productName: p.name,
      originalPrice: p.originalPrice,
      discountedPrice: p.discountedPrice || p.originalPrice,
      discountPercent: p.discountPercentage || 0,
      savings: p.discountedPrice ? p.originalPrice - p.discountedPrice : 0,
      expiryDate: p.expiryDate,
      stock: p.stock,
      unit: p.unit
    }));

    // Sort by best deal (lowest discounted price)
    priceComparison.sort((a, b) => a.discountedPrice - b.discountedPrice);

    // Find best deal
    const bestDeal = priceComparison[0];

    res.json({
      success: true,
      productName: product.name,
      category: product.category,
      totalStores: priceComparison.length,
      bestDeal,
      priceComparison
    });
  } catch (error) {
    console.error('Price comparison error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload product image
router.post('/upload-image', auth, authorize(['store_owner', 'admin']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Store owners and admins)
router.post('/', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found. Please create a store first.' 
      });
    }

    const { name, category, originalPrice, discountedPrice, stock, unit, expiryDate, description, images } = req.body;
    
    // Validate required fields
    if (!name || !category || !originalPrice || !stock || !unit || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, category, originalPrice, stock, unit, expiryDate' 
      });
    }

    const productData = {
      name,
      category,
      originalPrice: Number(originalPrice),
      discountedPrice: discountedPrice ? Number(discountedPrice) : Number(originalPrice),
      stock: Number(stock),
      unit,
      expiryDate: new Date(expiryDate),
      description: description || '',
      images: images || [],
      store: store._id
    };
    
    // Calculate discount
    if (productData.discountedPrice < productData.originalPrice) {
      productData.discountPercentage = Math.round(
        ((productData.originalPrice - productData.discountedPrice) / productData.originalPrice) * 100
      );
      productData.isDiscounted = true;
    } else {
      productData.discountPercentage = 0;
      productData.isDiscounted = false;
    }

    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update product (Store owners and Admin)
router.put('/:id', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'store_owner' && product.store.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const { name, category, originalPrice, discountedPrice, stock, unit, expiryDate, description, images } = req.body;
    
    // Update fields
    if (name) product.name = name;
    if (category) product.category = category;
    if (originalPrice) product.originalPrice = Number(originalPrice);
    if (discountedPrice !== undefined) product.discountedPrice = Number(discountedPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (unit) product.unit = unit;
    if (expiryDate) product.expiryDate = new Date(expiryDate);
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = images;
    
    // Recalculate discount
    if (product.discountedPrice < product.originalPrice) {
      product.discountPercentage = Math.round(
        ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
      );
      product.isDiscounted = true;
    } else {
      product.discountPercentage = 0;
      product.isDiscounted = false;
    }

    await product.save();
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product (Store owners and Admin with order check)
router.delete('/:id', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user owns this product's store (unless admin)
    if (req.user.role === 'store_owner' && product.store.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    // Check if product is in any pending orders
    const Order = require('../models/Order');
    const pendingOrders = await Order.find({
      'items.product_id': req.params.id,
      status: { $in: ['pending', 'confirmed', 'ready'] }
    });

    if (pendingOrders.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Product cannot be deleted - it has active orders. Please wait for orders to complete.' 
      });
    }

    // Delete all orders containing this product (completed orders)
    await Order.deleteMany({
      'items.product_id': req.params.id,
      status: 'completed'
    });

    await Product.findByIdAndDelete(req.params.id);
    
    // Update store stats
    await Store.findByIdAndUpdate(product.store._id, {
      $inc: { 'stats.totalProducts': -1 }
    });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting product' });
  }
});

// Get low stock products alert
router.get('/low-stock', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    let store;
    
    if (req.user.role === 'admin' && req.user.store_id) {
      store = await Store.findById(req.user.store_id);
    } else {
      store = await Store.findOne({ owner: req.user.id });
    }
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const lowStockProducts = await Product.find({ 
      store: store._id, 
      stock: { $lte: 5 },
      status: 'active'
    }).select('name stock unit category');

    res.json({ success: true, products: lowStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expiring products alert
router.get('/expiring-soon', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    let store;
    
    if (req.user.role === 'admin' && req.user.store_id) {
      store = await Store.findById(req.user.store_id);
    } else {
      store = await Store.findOne({ owner: req.user.id });
    }
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const expiringProducts = await Product.find({ 
      store: store._id, 
      expiryDate: { $lte: new Date(Date.now() + 2*24*60*60*1000) },
      status: 'active'
    }).select('name expiryDate stock unit category');

    res.json({ success: true, products: expiringProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk upload products from CSV
router.post('/bulk-upload', auth, authorize(['store_owner', 'admin']), csvUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const results = {
      successful: 0,
      failed: 0,
      total: 0,
      errors: []
    };

    const products = [];
    const filePath = req.file.path;

    // Read CSV file
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        results.total++;
        
        try {
          // Validate required fields
          if (!row.name || !row.category || !row.originalPrice || !row.stock || !row.unit || !row.expiryDate) {
            results.errors.push(`Row ${results.total}: Missing required fields`);
            results.failed++;
            return;
          }

          const originalPrice = Number(row.originalPrice);
          const discountedPrice = row.discountedPrice ? Number(row.discountedPrice) : originalPrice;
          const stock = Number(row.stock);

          if (isNaN(originalPrice) || isNaN(stock) || originalPrice <= 0 || stock < 0) {
            results.errors.push(`Row ${results.total}: Invalid price or stock values`);
            results.failed++;
            return;
          }

          const productData = {
            name: row.name.trim(),
            category: row.category.trim(),
            originalPrice,
            discountedPrice,
            stock,
            unit: row.unit.trim(),
            expiryDate: new Date(row.expiryDate),
            description: row.description || '',
            images: row.imageUrl ? [row.imageUrl] : [],
            store: store._id
          };

          // Calculate discount
          if (productData.discountedPrice < productData.originalPrice) {
            productData.discountPercentage = Math.round(
              ((productData.originalPrice - productData.discountedPrice) / productData.originalPrice) * 100
            );
            productData.isDiscounted = true;
          } else {
            productData.discountPercentage = 0;
            productData.isDiscounted = false;
          }

          products.push(productData);
          results.successful++;
        } catch (error) {
          results.errors.push(`Row ${results.total}: ${error.message}`);
          results.failed++;
        }
      })
      .on('end', async () => {
        try {
          // Insert valid products
          if (products.length > 0) {
            await Product.insertMany(products);
          }

          // Clean up temp file
          fs.unlinkSync(filePath);

          res.json({
            success: true,
            message: `Bulk upload completed. ${results.successful} products added successfully.`,
            results
          });
        } catch (error) {
          console.error('Bulk insert error:', error);
          res.status(500).json({ success: false, message: 'Failed to save products to database' });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        fs.unlinkSync(filePath);
        res.status(400).json({ success: false, message: 'Invalid CSV file format' });
      });

  } catch (error) {
    console.error('Bulk upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;