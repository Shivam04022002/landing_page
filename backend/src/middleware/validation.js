const Joi = require('joi');

const leadSchema = Joi.object({
  desiredLoanAmount: Joi.number().min(10000).required().messages({
    'number.base': 'Loan amount must be a number',
    'number.min': 'Minimum loan amount is ₹10,000',
    'any.required': 'Loan amount is required'
  }),
  useOfFunds: Joi.string().valid('Business Expansion', 'Inventory', 'Machinery', 'Working Capital', 'Personal Use', 'Other').required(),
  averageMonthlySale: Joi.string().valid('50k-1.5L', '1.5L-3L', '3L-5L', '5L+').required().messages({
    'any.only': 'Please select a valid monthly sale range',
    'any.required': 'Monthly sale is required'
  }),
  businessVintage: Joi.string().valid('Less than 1 year', '1-3 years', '3-5 years', '5+ years').required(),
  creditScore: Joi.string().valid('Below 550', '550-650', '650-750', '750+').required(),
  businessName: Joi.string().trim().max(100).required(),
  ownerName: Joi.string().trim().max(100).required(),
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number'
  }),
  pinCode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Please enter a valid 6-digit PIN code'
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'State is required'
  }),
  district: Joi.string().trim().required().messages({
    'any.required': 'District is required'
  }),
  country: Joi.string().trim().required().messages({
    'any.required': 'Country is required'
  }),
  utmSource: Joi.string().optional().allow(null, ''),
  utmCampaign: Joi.string().optional().allow(null, ''),
  utmMedium: Joi.string().optional().allow(null, '')
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

exports.validateLead = (req, res, next) => {
  const { error } = leadSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const messages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }
  
  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username and password'
    });
  }
  
  next();
};
