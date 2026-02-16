const mongoose = require('mongoose');

const ExtractedItemSchema = new mongoose.Schema({
    jobId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    flags: {
        isDuplicate: { type: Boolean, default: false },
        isFiltered: { type: Boolean, default: false },
        filterReason: String
    },
    ocr: {
        confidence: Number,
        boundingBox: {
            x: Number,
            y: Number,
            w: Number,
            h: Number
        }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExtractedItem', ExtractedItemSchema);
