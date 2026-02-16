const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const logger = require('./config/logger');
const connectDB = require('./services/db.service');
const apiRoutes = require('./routes/api.routes');
const errorHandler = require('./middleware/error.middleware');
const maintenanceService = require('./services/maintenance.service');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Start background maintenance tasks
maintenanceService.startScheduledCleanup();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Directories
const directories = [
    path.join(process.cwd(), 'temp/uploads'),
    path.join(process.cwd(), 'temp/results'),
    path.join(process.cwd(), 'logs'),
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Schematics OCR Backend is running with MongoDB' });
});

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    logger.info(`Server started on port ${port}`);
});

module.exports = app;
