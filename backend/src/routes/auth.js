const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validation');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create initial admin (for setup)
// @route   POST /api/auth/setup
// @access  Public (should be disabled in production)
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne();
    
    if (adminExists && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: 'Setup already completed'
      });
    }

    const { username, password } = req.body;

    const admin = await Admin.create({
      username,
      password,
      role: 'superadmin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
