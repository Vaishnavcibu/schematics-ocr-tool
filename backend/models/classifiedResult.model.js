const mongoose = require('mongoose');

const ClassifiedResultSchema = new mongoose.Schema({
    jobId: { type: String, required: true, index: true },
    extractedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtractedItem' },
    text: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    heading: { type: String, required: true, index: true },
    classification: {
        score: Number,
        level: { type: String, enum: ['high', 'medium', 'low'] },
        model: String,
        tokensUsed: Number,
        timestamp: { type: Date, default: Date.now }
    },
    edits: {
        isEdited: { type: Boolean, default: false },
        originalHeading: String,
        editedAt: Date
    }
});

module.exports = mongoose.model('ClassifiedResult', ClassifiedResultSchema);
