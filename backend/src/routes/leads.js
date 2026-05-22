const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');
const { validateLead } = require('../middleware/validation');
const UAParser = require('ua-parser-js');
const requestIp = require('request-ip');

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public
router.post('/', validateLead, async (req, res) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const deviceInfo = parser.getResult();

    const leadData = {
      ...req.body,
      source: req.body.utmSource === 'google' ? 'Google Ads' : 'Organic',
      device: deviceInfo.device.type || 'desktop',
      browser: deviceInfo.browser.name,
      ipAddress: requestIp.getClientIp(req)
    };

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const source = req.query.source || '';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by source
    if (source) {
      query.source = source;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Lead.countDocuments(query);
    const todayLeads = await Lead.countDocuments({
      ...query,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthLeads = await Lead.countDocuments({
      ...query,
      createdAt: { $gte: monthStart }
    });

    res.json({
      success: true,
      count: leads.length,
      total,
      todayLeads,
      monthLeads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Export leads to Excel
// @route   GET /api/leads/export
// @access  Private (Admin)
router.get('/export', protect, async (req, res) => {
  try {
    const { startDate, endDate, source } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (source) {
      query.source = source;
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    const exportData = leads.map(lead => ({
      'Loan Amount': lead.desiredLoanAmount,
      'Use of Funds': lead.useOfFunds,
      'Monthly Sale': lead.averageMonthlySale,
      'Business Vintage': lead.businessVintage,
      'Credit Score': lead.creditScore,
      'Business Name': lead.businessName,
      'Owner Name': lead.ownerName,
      'Phone': lead.phoneNumber,
      'Pin Code': lead.pinCode,
      'Lead Source': lead.source,
      'UTM Source': lead.utmSource || '',
      'UTM Campaign': lead.utmCampaign || '',
      'UTM Medium': lead.utmMedium || '',
      'Device': lead.device || '',
      'Browser': lead.browser || '',
      'IP Address': lead.ipAddress || '',
      'Created Date': lead.createdAt.toLocaleString('en-IN')
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    xlsx.utils.book_append_sheet(wb, ws, 'Leads');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get dashboard stats
// @route   GET /api/leads/stats/dashboard
// @access  Private (Admin)
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const totalLeads = await Lead.countDocuments();
    const todayLeads = await Lead.countDocuments({ createdAt: { $gte: today } });
    const monthLeads = await Lead.countDocuments({ createdAt: { $gte: monthStart } });

    const sourceStats = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalLeads,
        todayLeads,
        monthLeads,
        sourceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
