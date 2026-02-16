const Job = require('../models/job.model');
const ExtractedItem = require('../models/extractedItem.model');
const ClassifiedResult = require('../models/classifiedResult.model');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

class HistoryController {
    /**
     * Get paginated list of all processing jobs
     */
    async getHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const jobs = await Job.find({ 'metadata.deletedAt': { $exists: false } })
                .sort({ 'timestamps.createdAt': -1 })
                .skip(skip)
                .limit(limit);

            const total = await Job.countDocuments({ 'metadata.deletedAt': { $exists: false } });

            res.json({
                success: true,
                data: {
                    jobs,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            logger.error('Get history error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'Could not fetch history' }
            });
        }
    }

    /**
     * Delete a job and all associated data/files
     */
    async deleteJob(req, res) {
        try {
            const { job_id } = req.params;
            const job = await Job.findOne({ jobId: job_id });

            if (!job) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
                });
            }

            // 1. Delete associated data in DB
            await ExtractedItem.deleteMany({ jobId: job_id });
            await ClassifiedResult.deleteMany({ jobId: job_id });

            // 2. Delete physical files
            const filesToDelete = [
                job.paths.pdfPath,
                path.join(process.cwd(), 'temp/results', `${job_id}.json`),
                path.join(process.cwd(), 'temp/results', `${job_id}.xlsx`),
                path.join(process.cwd(), 'temp/results', `${job_id}.csv`)
            ];

            filesToDelete.forEach(filePath => {
                if (filePath && fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        logger.info(`Deleted file: ${filePath}`);
                    } catch (e) {
                        logger.warn(`Could not delete file ${filePath}: ${e.message}`);
                    }
                }
            });

            // 3. Delete the job record itself
            await Job.deleteOne({ jobId: job_id });

            res.json({
                success: true,
                message: `Job ${job_id} and all associated data deleted successfully`
            });

        } catch (error) {
            logger.error('Delete job error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred while deleting the job' }
            });
        }
    }
}

module.exports = new HistoryController();
