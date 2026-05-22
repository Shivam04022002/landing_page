// Load environment variables FIRST - before any other imports
require('dotenv').config();

// Debug: Show environment loading
console.log('📁 ENV PATH:', process.cwd());
console.log('🔑 MONGODB_URI from env:', process.env.MONGODB_URI || 'NOT SET');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');

// Import database module
const { connectDB, disconnectDB } = require('../config/db');

const errorHandler = require('./middleware/errorHandler');
const leadsRouter = require('./routes/leads');
const authRouter = require('./routes/auth');
const pincodeRouter = require('./routes/pincode');

const app = express();

// Trust proxy - required for rate limiting behind nginx/load balancer
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - trust proxy enabled for X-Forwarded-For header
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limiting for lead creation
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 lead submissions per hour
  message: 'Too many lead submissions from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/leads', leadLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/pincode', pincodeRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

// Track server state
let server;
let isShuttingDown = false;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Try to connect to MongoDB (with retries built-in)
    await connectDB();
    
    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Connected to ENV URI' : 'Using Fallback'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check EC2 MongoDB status: sudo systemctl status mongod');
    console.log('   2. Verify EC2 Security Group allows port 27017');
    console.log('   3. Check MONGODB_URI in .env file');
    console.log('   4. For local dev without .env: uses localhost fallback\n');
    
    // Exit with error code for production monitoring
    process.exit(1);
  }
};

// Start the application
startServer();

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server (stop accepting new connections)
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
  }
  
  // Close database connection
  try {
    await disconnectDB();
    console.log('✅ Database disconnected');
  } catch (err) {
    console.error('❌ Error during database disconnect:', err.message);
  }
  
  // Exit process
  console.log('👋 Process terminated gracefully\n');
  process.exit(0);
};

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit immediately in production - let existing requests complete
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = app;
