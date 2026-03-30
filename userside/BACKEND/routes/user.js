const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/user/save
// @desc    Toggle saving a product
// @access  Private
router.post('/save', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const index = user.savedProducts.indexOf(productId);

    if (index === -1) {
      user.savedProducts.push(productId);
      await user.save();
      return res.json({ msg: 'Product saved', saved: true });
    } else {
      user.savedProducts.splice(index, 1);
      await user.save();
      return res.json({ msg: 'Product removed from saved', saved: false });
    }
  } catch (error) {
    console.error('Save product error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/user/saved
// @desc    Get all saved products
// @access  Private
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProducts');
    res.json(user.savedProducts);
  } catch (error) {
    console.error('Get saved products error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/user/buy
// @desc    Buy a product
// @access  Private
router.post('/buy', authMiddleware, async (req, res) => {
  const { productId, quantity, paymentMethod, transactionId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock' });
    }

    // Update product stock and sales count
    product.stock -= quantity;
    product.salesCount = (product.salesCount || 0) + quantity;
    await product.save();

    // Add to user's bought history
    user.boughtProducts.push({
      product: productId,
      quantity,
      paymentMethod: paymentMethod || 'offline',
      transactionId: transactionId || '',
      purchaseDate: new Date()
    });
    
    await user.save();
    
    res.json({ msg: 'Purchase successful', boughtProducts: user.boughtProducts });
  } catch (error) {
    console.error('Buy product error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/user/bought
// @desc    Get purchase history
// @access  Private
router.get('/bought', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('boughtProducts.product');
    res.json(user.boughtProducts);
  } catch (error) {
    console.error('Get bought products error:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
