// models/testimonialModel.js
const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  text: {
    type: String,
    required: [true, 'Please add testimonial text'],
    trim: true,
    maxlength: [500, 'Testimonial cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters'],
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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
TestimonialSchema.index({ isActive: 1, order: 1 });
TestimonialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Testimonial', TestimonialSchema);