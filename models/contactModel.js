// models/contactModel.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  // Address
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  
  // Email
  email: {
    type: String,
    required: [true, 'Please add an email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  
  // Phone
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true
  },
  
  // Timing
  timing: {
    type: String,
    required: [true, 'Please add timing'],
    trim: true,
    default: 'Mon - Sun : 10:00 AM - 07:00 PM'
  },
  
  // Map Embed URL
  mapUrl: {
    type: String,
    required: [true, 'Please add a map URL'],
    trim: true
  },
  
  // Social Media Links (Optional)
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', ContactSchema);