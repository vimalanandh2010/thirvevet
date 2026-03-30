const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin signup route
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, location } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or phone already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      role: 'admin' // Force role to admin for this route
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } 
    });
  } catch (error) {
    console.error('Admin Signup Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload Product
router.post('/products', async (req, res) => {
  try {
    const { name, price, category, stock, description, imageUrl } = req.body;
    const newProduct = new Product({
      name,
      price,
      category,
      stock,
      description,
      imageUrl
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Product upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders from all users
router.get('/orders', async (req, res) => {
  try {
    const usersWithOrders = await User.find({ 
      'boughtProducts.0': { $exists: true } 
    }).populate('boughtProducts.product').select('name email phone location boughtProducts');

    // Flatten the orders to make it easier for the frontend
    const allOrders = [];
    usersWithOrders.forEach(user => {
      user.boughtProducts.forEach(order => {
        allOrders.push({
          orderId: order._id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          userLocation: user.location,
          product: order.product,
          quantity: order.quantity,
          paymentMethod: order.paymentMethod,
          transactionId: order.transactionId,
          purchaseDate: order.purchaseDate,
          totalPrice: order.product ? (order.product.price * order.quantity) : 0
        });
      });
    });

    // Sort by most recent
    allOrders.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    res.json(allOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;