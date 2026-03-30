const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Signup route
router.post('/signup', async (req, res) => {
  const { name, location, phone, email, password } = req.body;
  
  if (!name || !location || !phone || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const errorMsg = existingUser.email === email ? 'Email already registered.' : 'Phone number already registered.';
      return res.status(409).json({ message: errorMsg });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({
      name,
      location,
      phone,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET || 'your_super_secret_key_for_thrivevet_12345', 
      { expiresIn: '7d' }
    );

    console.log('User Registered Successfully:', newUser.email);
    res.status(201).json({ 
      message: 'Signup Successful!', 
      token, 
      user: { id: newUser._id, email: newUser.email, name: newUser.name } 
    });
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your_super_secret_key_for_thrivevet_12345', 
      { expiresIn: '7d' }
    );

    console.log('User logged in successfully:', user.email);
    res.status(200).json({ 
      message: 'Login successful!', 
      token,
      user: { id: user._id, email: user.email, name: user.name } 
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Protected route example
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
