require('dotenv').config();

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharek-app';

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connectDB;
