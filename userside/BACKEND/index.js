require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'https://userside-frontend.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server/health probes with no origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 TIP: Make sure you have added your MongoDB URI in the .env file.');
  });

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);

// Initial Test Route
app.get('/', (req, res) => {
  res.send('ThriveVet Backend Server is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'thrivevet-backend' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
