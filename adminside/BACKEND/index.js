require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked for this origin'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));
app.options('*', cors());

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

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'thrivevet-admin-backend' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin Backend running on port ${PORT}`);
});