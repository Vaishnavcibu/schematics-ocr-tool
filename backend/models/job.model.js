const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileHash: { type: String },

    // Configuration
    config: {
        mainHeadings: [String],
        testPointFilters: [String],
        componentFilters: [String],
        regexMode: { type: Boolean, default: false }
    },

    // Status & Progress
    status: {
        state: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], default: 'pending' },
        stage: { type: String, enum: ['upload', 'ocr', 'dedup', 'filter', 'classify', 'export'], default: 'upload' },
        progress: { type: Number, default: 0 },
        errorMessage: String,
        errorStage: String,
        retryCount: { type: Number, default: 0 }
    },

    // Timestamps
    timestamps: {
        createdAt: { type: Date, default: Date.now },
        startedAt: Date,
        completedAt: Date,
        processingTimeSeconds: Number
    },

    // Statistics
    stats: {
        totalExtracted: { type: Number, default: 0 },
        duplicatesRemoved: { type: Number, default: 0 },
        filteredCount: { type: Number, default: 0 },
        itemsAfterFilter: { type: Number, default: 0 },
        classifiedCount: { type: Number, default: 0 },
        unclassifiedCount: { type: Number, default: 0 },
        pagesProcessed: { type: Number, default: 0 }
    },

    // File Paths
    paths: {
        pdfPath: String,
        resultJsonPath: String
    },

    metadata: {
        userAgent: String,
        deletedAt: Date
    }
});

module.exports = mongoose.model('Job', JobSchema);
