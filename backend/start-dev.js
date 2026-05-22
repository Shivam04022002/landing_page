#!/usr/bin/env node
/**
 * Development Startup Script
 * Handles MongoDB connection checks and provides helpful error messages
 */

const { spawn } = require('child_process');
const net = require('net');

const MONGO_PORT = 27017;
const MONGO_HOST = '127.0.0.1';

// Check if MongoDB is running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(2000);
    
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(MONGO_PORT, MONGO_HOST);
  });
};

// Check environment file
const checkEnvFile = () => {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found!');
    
    if (fs.existsSync(envExamplePath)) {
      console.log('📄 Creating .env from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created. Please edit it with your values.\n');
    } else {
      console.log('❌ .env.example not found!');
    }
    
    return false;
  }
  
  return true;
};

// Main startup
const start = async () => {
  console.log('🚀 Starting Finance Leads Backend...\n');
  
  // Check .env file
  const hasEnv = checkEnvFile();
  if (!hasEnv) {
    process.exit(1);
  }
  
  // Check MongoDB
  const mongoRunning = await checkMongoDB();
  
  if (!mongoRunning) {
    console.log('⚠️  MongoDB is not running on localhost:27017');
    console.log('\n💡 Options:');
    console.log('   1. Start local MongoDB:');
    console.log('      Windows: net start MongoDB');
    console.log('      Linux:   sudo systemctl start mongod');
    console.log('   2. Use MongoDB Atlas (cloud database)');
    console.log('      - Update MONGODB_URI in .env file');
    console.log('      - Get free cluster at https://cloud.mongodb.com\n');
    
    // Continue anyway - the app has retry logic
    console.log('⏳ Attempting to start server (will retry connection)...\n');
  } else {
    console.log('✅ MongoDB is running on localhost:27017\n');
  }
  
  // Start the server with nodemon
  const nodemon = spawn('npx', ['nodemon', 'src/server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  nodemon.on('error', (err) => {
    console.error('❌ Failed to start nodemon:', err.message);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    nodemon.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    nodemon.kill('SIGTERM');
  });
};

start();
