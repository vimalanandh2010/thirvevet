require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database Connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Admin Side Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Admin Side MongoDB Connection Error:', err.message);
  });

// Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Initial Test Route
app.get('/', (req, res) => {
  res.send('ThriveVet Admin Backend Server is running...');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin Backend running on port ${PORT}`);
});