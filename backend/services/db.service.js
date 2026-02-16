const mongoose = require('mongoose');
const logger = require('./config/logger');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schematics_ocr';
        await mongoose.connect(mongoURI);
        logger.info('✅ MongoDB Connected Successfully');
    } catch (error) {
        logger.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
