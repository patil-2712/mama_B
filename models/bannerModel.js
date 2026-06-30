// models/bannerModel.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please add a banner image']
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true,
    maxlength: [50, 'Button text cannot be more than 50 characters']
  },
  buttonLink: {
    type: String,
    default: '/shop',
    trim: true
  },
  position: {
    type: String,
    enum: ['hero', 'featured', 'promotion', 'sidebar'],
    default: 'hero'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
BannerSchema.index({ position: 1, order: 1 });
BannerSchema.index({ isActive: 1, isFeatured: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Banner', BannerSchema);