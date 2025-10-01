const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');
require('dotenv').config();
const { connectDB } = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const setupRoutes = require('./routes/setupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const amountRoutes = require('./routes/amountRoutes');
const groupMemberRoutes = require('./routes/groupMemberRoutes');

// Initialize express app
const app = express();

// Initialize database connection
(async () => {
  try {
    await connectDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database, but server will continue to run.');
    console.error('Some API endpoints that require database access will not work correctly.');
  }
})();

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: false,
  abortOnLimit: true
}));

// API versioning and root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'NatiApp API',
    version: '1.0.0'
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/amounts', amountRoutes);
app.use('/api/group-members', groupMemberRoutes);

// Error handler middleware
app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {

  // Mostrar todas las direcciones IP disponibles
  try {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (loopback) addresses
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`Server also accessible at http://${net.address}:${PORT}`);
        }
      }
    }
  } catch (err) {
    console.error('Error detecting network interfaces:', err.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
