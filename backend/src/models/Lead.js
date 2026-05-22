const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  desiredLoanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [10000, 'Minimum loan amount is ₹10,000']
  },
  useOfFunds: {
    type: String,
    required: [true, 'Use of funds is required'],
    enum: ['Business Expansion', 'Inventory', 'Machinery', 'Working Capital', 'Personal Use', 'Other']
  },
  averageMonthlySale: {
    type: Number,
    required: [true, 'Monthly sale is required']
  },
  businessVintage: {
    type: String,
    required: [true, 'Business vintage is required'],
    enum: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years']
  },
  creditScore: {
    type: String,
    required: [true, 'Credit score is required'],
    enum: ['Below 550', '550-650', '650-750', '750+']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  pinCode: {
    type: String,
    required: [true, 'PIN code is required'],
    match: [/^\d{6}$/, 'Please enter a valid 6-digit PIN code']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  },
  source: {
    type: String,
    default: 'Organic'
  },
  utmSource: {
    type: String,
    default: null
  },
  utmCampaign: {
    type: String,
    default: null
  },
  utmMedium: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null
  },
  browser: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ createdAt: -1 });
leadSchema.index({ phoneNumber: 1 });
leadSchema.index({ source: 1 });

module.exports = mongoose.model('Lead', leadSchema);
