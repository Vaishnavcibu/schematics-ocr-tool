const Job = require('../models/job.model');
const logger = require('../config/logger');
const processor = require('../services/processor');
const { v4: uuidv4 } = require('uuid');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_FILE', message: 'No PDF file was uploaded' }
            });
        }

        const { mainHeadings, testPointFilters, componentFilters, regexMode } = req.validatedBody;

        // Create a new processing job using Mongoose
        const job = new Job({
            jobId: uuidv4(),
            filename: req.file.originalname,
            fileSize: req.file.size,
            config: {
                mainHeadings,
                testPointFilters,
                componentFilters,
                regexMode
            },
            paths: {
                pdfPath: req.file.path
            },
            metadata: {
                userAgent: req.headers['user-agent']
            }
        });

        await job.save();

        logger.info(`Job created in MongoDB: ${job.jobId} for file ${req.file.originalname}`);

        // Trigger background processing
        processor.processJob(job.jobId).catch(err => {
            logger.error(`Processor trigger failed for ${job.jobId}:`, err);
        });

        res.status(202).json({
            success: true,
            data: {
                job_id: job.jobId,
                status: job.status.state,
                estimated_time_seconds: 300
            }
        });

    } catch (error) {
        logger.error('Upload controller error (MongoDB):', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred while creating the job' }
        });
    }
};

module.exports = { uploadFile };
