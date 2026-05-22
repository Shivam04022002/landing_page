#!/usr/bin/env node
/**
 * Generate secure secrets for production
 * Run: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generating Secure Secrets for Production\n');
console.log('==========================================\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n-------------------------------------------\n');

// Generate random password suggestion
const generatePassword = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

console.log('Suggested Admin Password:');
console.log(generatePassword());
console.log('\n-------------------------------------------\n');

console.log('✅ Copy these values to your GitHub Secrets!\n');
console.log('Next steps:');
console.log('1. Add JWT_SECRET to GitHub Secrets');
console.log('2. Add ADMIN_PASSWORD to GitHub Secrets');
console.log('3. Get MONGODB_URI from MongoDB Atlas');
console.log('4. Configure AWS credentials\n');
