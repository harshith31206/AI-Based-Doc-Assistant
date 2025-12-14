const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    path: { type: String, required: true },
    extractedText: { type: String }, // Store extracted text for LLM context
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
