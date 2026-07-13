// controllers/customerContactController.js
const CustomerContact = require('../models/customerContactModel');
const { validationResult } = require('express-validator');

// @desc    Submit customer contact form (Public)
// @route   POST /api/customer-contact/submit
// @access  Public
exports.submitCustomerContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, message } = req.body;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const customerContact = await CustomerContact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      ipAddress: ipAddress,
      userAgent: userAgent
    });

    console.log(`📩 New customer contact from ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: {
        id: customerContact._id,
        name: customerContact.name,
        email: customerContact.email
      }
    });

  } catch (error) {
    console.error('Submit Customer Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all customer contacts (Admin)
// @route   GET /api/admin/customer-contacts
// @access  Private (Admin only)
exports.getCustomerContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      isRead,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await CustomerContact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomerContact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Customer Contacts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single customer contact (Admin)
// @route   GET /api/admin/customer-contacts/:id
// @access  Private (Admin only)
exports.getCustomerContact = async (req, res) => {
  try {
    const contact = await CustomerContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Customer contact not found'
      });
    }

    // Mark as read if not already
    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = new Date();
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get Customer Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update customer contact status (Admin)
// @route   PATCH /api/admin/customer-contacts/:id/status
// @access  Private (Admin only)
exports.updateCustomerContactStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['pending', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, read, replied, or archived'
      });
    }

    const contact = await CustomerContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Customer contact not found'
      });
    }

    contact.status = status;
    if (notes) contact.notes = notes;
    
    if (status === 'read' && !contact.isRead) {
      contact.isRead = true;
      contact.readAt = new Date();
    }
    
    if (status === 'replied') {
      contact.repliedAt = new Date();
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: `Contact status updated to ${status}`,
      data: contact
    });
  } catch (error) {
    console.error('Update Customer Contact Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark contact as read (Admin)
// @route   PATCH /api/admin/customer-contacts/:id/read
// @access  Private (Admin only)
exports.markAsRead = async (req, res) => {
  try {
    const contact = await CustomerContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Customer contact not found'
      });
    }

    contact.isRead = true;
    contact.readAt = new Date();
    contact.status = 'read';
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact marked as read',
      data: contact
    });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark contact as replied (Admin)
// @route   PATCH /api/admin/customer-contacts/:id/replied
// @access  Private (Admin only)
exports.markAsReplied = async (req, res) => {
  try {
    const { notes } = req.body;
    const contact = await CustomerContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Customer contact not found'
      });
    }

    contact.status = 'replied';
    contact.repliedAt = new Date();
    if (notes) contact.notes = notes;
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact marked as replied',
      data: contact
    });
  } catch (error) {
    console.error('Mark as Replied Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete customer contact (Admin)
// @route   DELETE /api/admin/customer-contacts/:id
// @access  Private (Admin only)
exports.deleteCustomerContact = async (req, res) => {
  try {
    const contact = await CustomerContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Customer contact not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete Customer Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get customer contact stats (Admin)
// @route   GET /api/admin/customer-contacts/stats
// @access  Private (Admin only)
exports.getCustomerContactStats = async (req, res) => {
  try {
    const total = await CustomerContact.countDocuments();
    const pending = await CustomerContact.countDocuments({ status: 'pending' });
    const read = await CustomerContact.countDocuments({ status: 'read' });
    const replied = await CustomerContact.countDocuments({ status: 'replied' });
    const archived = await CustomerContact.countDocuments({ status: 'archived' });
    const unread = await CustomerContact.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        read,
        replied,
        archived,
        unread
      }
    });
  } catch (error) {
    console.error('Get Customer Contact Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};