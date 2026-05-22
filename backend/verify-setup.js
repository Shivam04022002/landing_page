#!/usr/bin/env node
/**
 * Setup Verification Script
 * Checks all requirements before starting the server
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

console.log('🔍 Verifying Backend Setup...\n');
console.log('=' .repeat(50));

let issues = [];
let warnings = [];

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`\n📦 Node.js Version: ${nodeVersion}`);
if (majorVersion < 16) {
  issues.push('Node.js version 16+ required. Current: ' + nodeVersion);
}

// Check .env file
console.log('\n📄 Environment File:');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  
  requiredVars.forEach(variable => {
    const regex = new RegExp(`^${variable}=.+`, 'm');
    if (regex.test(envContent)) {
      const value = envContent.match(new RegExp(`^${variable}=(.+)$`, 'm'))?.[1];
      if (value && !value.includes('your_') && !value.includes('example')) {
        console.log(`  ✅ ${variable} is set`);
      } else {
        warnings.push(`${variable} has default/example value`);
        console.log(`  ⚠️  ${variable} has default value`);
      }
    } else {
      issues.push(`${variable} is missing in .env`);
      console.log(`  ❌ ${variable} is missing`);
    }
  });
} else {
  issues.push('.env file not found');
  console.log('  ❌ .env file not found');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('\n💡 Run: cp .env.example .env');
  }
}

// Check node_modules
console.log('\n📦 Dependencies:');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('  ✅ node_modules exists');
  
  // Check key packages
  const requiredPackages = ['express', 'mongoose', 'axios', 'dotenv', 'cors', 'jsonwebtoken'];
  requiredPackages.forEach(pkg => {
    if (fs.existsSync(path.join(__dirname, 'node_modules', pkg))) {
      console.log(`  ✅ ${pkg}`);
    } else {
      issues.push(`Package ${pkg} not installed`);
      console.log(`  ❌ ${pkg} missing`);
    }
  });
} else {
  issues.push('node_modules not found. Run: npm install');
  console.log('  ❌ node_modules not found');
}

// Check MongoDB connection
console.log('\n🗄️  MongoDB Connection:');
const checkMongo = () => {
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
    
    socket.connect(27017, '127.0.0.1');
  });
};

checkMongo().then(isRunning => {
  if (isRunning) {
    console.log('  ✅ MongoDB is running on localhost:27017');
  } else {
    warnings.push('MongoDB not running on localhost:27017');
    console.log('  ⚠️  MongoDB not running on localhost:27017');
    console.log('     (This is OK if using MongoDB Atlas)');
  }
  
  // Check project structure
  console.log('\n📁 Project Structure:');
  const requiredFiles = [
    'src/server.js',
    'config/db.js',
    'src/routes/leads.js',
    'src/routes/auth.js',
    'src/models/Lead.js'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`  ✅ ${file}`);
    } else {
      issues.push(`Missing file: ${file}`);
      console.log(`  ❌ ${file} missing`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary:\n');
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Ready to start.');
    console.log('\n🚀 Start the server with:');
    console.log('   npm run dev');
  } else {
    if (issues.length > 0) {
      console.log('❌ Issues Found:');
      issues.forEach(issue => console.log(`   • ${issue}`));
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
      console.log('');
    }
    
    console.log('💡 Fix the issues above, then run again.');
    
    if (issues.length > 0) {
      process.exit(1);
    }
  }
  
  console.log('\n📚 Quick Commands:');
  console.log('   npm run dev      - Start with MongoDB check');
  console.log('   npm start        - Start production');
  console.log('   npm run check    - Check environment');
  console.log('\n');
});
