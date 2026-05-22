const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// Create HTTPS agent that accepts the expired cert (only for postalpincode API)
const postalPincodeAgent = new https.Agent({
  rejectUnauthorized: false // Only for this specific external API
});

// Proxy endpoint for PIN code lookup
router.get('/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate PIN code format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN code format'
      });
    }
    
    // Call Indian Postal API with custom HTTPS agent to bypass expired cert
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
      timeout: 10000,
      httpsAgent: postalPincodeAgent, // Use agent that accepts expired cert
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Return the data
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('PIN Code API Error:', error.message);
    console.error('Full error:', error.response?.data || error.code || error);
    
    // Check if it's a network/connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Postal service temporarily unavailable',
        error: 'External API connection failed'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PIN code details',
      error: error.message
    });
  }
});

module.exports = router;
