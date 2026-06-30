// models/aboutModel.js
const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  // Section 1
  title1: {
    type: String,
    required: [true, 'Please add title 1'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  paragraph1: {
    type: String,
    required: [true, 'Please add paragraph 1'],
    trim: true,
    maxlength: [1000, 'Paragraph cannot be more than 1000 characters']
  },
  image1: {
    type: String,
    required: [true, 'Please add image 1']
  },
  
  // Section 2
  title2: {
    type: String,
    required: [true, 'Please add title 2'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  paragraph2: {
    type: String,
    required: [true, 'Please add paragraph 2'],
    trim: true,
    maxlength: [1000, 'Paragraph cannot be more than 1000 characters']
  },
  image2: {
    type: String,
    required: [true, 'Please add image 2']
  },
  
  // Additional Info
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

module.exports = mongoose.model('About', AboutSchema);