// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try both possible variable names
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in .env');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    
    // Remove deprecated options for Mongoose v7+
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;