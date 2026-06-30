// models/galleryModel.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  // Images
  image1: {
    type: String,
    required: [true, 'Please add image 1']
  },
  image1Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  image1Alt: {
    type: String,
    trim: true,
    maxlength: [100, 'Alt text cannot be more than 100 characters'],
    default: ''
  },
  
  image2: {
    type: String,
    required: [true, 'Please add image 2']
  },
  image2Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  image2Alt: {
    type: String,
    trim: true,
    maxlength: [100, 'Alt text cannot be more than 100 characters'],
    default: ''
  },
  
  image3: {
    type: String,
    required: [true, 'Please add image 3']
  },
  image3Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  image3Alt: {
    type: String,
    trim: true,
    maxlength: [100, 'Alt text cannot be more than 100 characters'],
    default: ''
  },

  // Videos (stored as file paths)
  video1: {
    type: String,
    required: [true, 'Please add video 1'],
    trim: true
  },
  video1Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  video1Description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    default: ''
  },
  
  video2: {
    type: String,
    required: [true, 'Please add video 2'],
    trim: true
  },
  video2Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  video2Description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    default: ''
  },
  
  video3: {
    type: String,
    required: [true, 'Please add video 3'],
    trim: true
  },
  video3Title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: ''
  },
  video3Description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    default: ''
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

module.exports = mongoose.model('Gallery', GallerySchema);