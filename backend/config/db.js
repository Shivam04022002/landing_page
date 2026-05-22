/**
 * Database Connection Module
 * Supports: Local MongoDB & MongoDB Atlas
 * Features: Retry logic, graceful handling, production-ready
 */

const mongoose = require('mongoose');

// Connection state tracking
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Get MongoDB URI from environment
 * Production: MONGODB_URI required
 * Development: fallback to localhost if not set
 */
const getMongoURI = () => {
  const envUri = process.env.MONGODB_URI;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (envUri) {
    console.log('   📄 Mongo URI Source: ENV');
    return envUri;
  }
  
  // Development fallback allowed
  if (nodeEnv === 'development') {
    console.log('   📄 Mongo URI Source: FALLBACK (localhost)');
    console.log('   ⚠️  Using fallback: mongodb://127.0.0.1:27017/finance_leads');
    return 'mongodb://127.0.0.1:27017/finance_leads';
  }
  
  // Production requires explicit URI
  throw new Error(
    'MONGODB_URI environment variable is required in production.\n' +
    'Example: MONGODB_URI=mongodb://13.235.248.212:27017/finance_leads\n' +
    'Set it in your .env file or environment variables.'
  );
};

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  // Debug: Show raw env var before processing
  console.log('\n🛠️  DB Connection Debug:');
  console.log('   Raw MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  
  // Show environment status
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`\n🔧 Loaded ENV: ${nodeEnv}`);
  
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Using existing MongoDB connection');
    return mongoose.connection;
  }

  const mongoURI = getMongoURI();
  
  // Hide credentials in logs
  const safeURI = mongoURI.includes('@') 
    ? mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    : mongoURI;
  
  console.log(`🔌 Connecting to MongoDB: ${safeURI}`);

  // MongoDB Atlas optimized options
  const mongooseOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority'
  };

  try {
    const conn = await mongoose.connect(mongoURI, mongooseOptions);
    
    isConnected = true;
    retryCount = 0;
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
    
  } catch (error) {
    retryCount++;
    
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount}/${MAX_RETRIES}):`);
    console.error(`   ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(); // Retry
    } else {
      console.error('❌ Max retries reached. Could not connect to MongoDB.');
      console.error('   Troubleshooting:');
      console.error('   1. Check EC2 MongoDB is running: sudo systemctl status mongod');
      console.error('   2. Verify port 27017 is open in EC2 Security Group');
      console.error('   3. Check bindIp is 0.0.0.0 in /etc/mongod.conf');
      console.error('   4. Verify MONGODB_URI in .env file');
      throw error;
    }
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  if (!isConnected) return;
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('📦 MongoDB Disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Get connection status
 */
const getConnectionStatus = () => ({
  isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name
});

/**
 * Monitor connection events
 */
mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('📦 Mongoose disconnected');
  isConnected = false;
});

// Handle process termination - graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  getMongoURI
};
