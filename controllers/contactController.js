// controllers/contactController.js
const Contact = require('../models/contactModel');
const { validationResult } = require('express-validator');

// @desc    Create Contact Info
// @route   POST /api/admin/contact
// @access  Private (Admin only)
exports.createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if contact info already exists
    const existingContact = await Contact.findOne();
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact info already exists. Please update instead.'
      });
    }

    const { 
      address, 
      email, 
      phone, 
      timing, 
      mapUrl,
      socialMedia 
    } = req.body;

    const contact = await Contact.create({
      address: address.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      timing: timing || 'Mon - Sun : 10:00 AM - 07:00 PM',
      mapUrl: mapUrl || '',
      socialMedia: socialMedia || {},
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Contact info created successfully',
      data: contact
    });
  } catch (error) {
    console.error('Create Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update Contact Info
// @route   PUT /api/admin/contact/:id
// @access  Private (Admin only)
exports.updateContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact info not found'
      });
    }

    const { 
      address, 
      email, 
      phone, 
      timing, 
      mapUrl,
      socialMedia 
    } = req.body;

    const updateData = {
      address: address ? address.trim() : contact.address,
      email: email ? email.trim().toLowerCase() : contact.email,
      phone: phone ? phone.trim() : contact.phone,
      timing: timing || contact.timing,
      mapUrl: mapUrl || contact.mapUrl,
      socialMedia: socialMedia || contact.socialMedia
    };

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Contact info updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get Contact Info (Public)
// @route   GET /api/contact
// @access  Public
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ isActive: true })
      .populate('createdBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact info not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get Contact Info (Admin)
// @route   GET /api/admin/contact
// @access  Private (Admin only)
exports.getAdminContact = async (req, res) => {
  try {
    const contact = await Contact.findOne()
      .populate('createdBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact info not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get Admin Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle Contact Status
// @route   PATCH /api/admin/contact/:id/toggle
// @access  Private (Admin only)
exports.toggleContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact info not found'
      });
    }

    contact.isActive = !contact.isActive;
    await contact.save();

    res.status(200).json({
      success: true,
      message: `Contact info ${contact.isActive ? 'activated' : 'deactivated'} successfully`,
      data: contact
    });
  } catch (error) {
    console.error('Toggle Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete Contact Info
// @route   DELETE /api/admin/contact/:id
// @access  Private (Admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact info not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact info deleted successfully'
    });
  } catch (error) {
    console.error('Delete Contact Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};