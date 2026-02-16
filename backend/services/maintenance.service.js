const Job = require('../models/job.model');
const ExtractedItem = require('../models/extractedItem.model');
const ClassifiedResult = require('../models/classifiedResult.model');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

class MaintenanceService {
    /**
     * Deletes jobs and associated data older than the specified retention days
     * @param {number} retentionDays 
     */
    async cleanupOldJobs(retentionDays = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            logger.info(`Running auto-cleanup for jobs older than ${retentionDays} days (Before ${cutoffDate.toISOString()})`);

            const oldJobs = await Job.find({
                'timestamps.createdAt': { $lt: cutoffDate }
            });

            if (oldJobs.length === 0) {
                logger.info('No old jobs found to clean up.');
                return 0;
            }

            for (const job of oldJobs) {
                const jobId = job.jobId;

                // Delete items and results
                await ExtractedItem.deleteMany({ jobId });
                await ClassifiedResult.deleteMany({ jobId });

                // Delete files
                const filesToDelete = [
                    job.paths.pdfPath,
                    path.join(process.cwd(), 'temp/results', `${jobId}.json`),
                    path.join(process.cwd(), 'temp/results', `${jobId}.xlsx`),
                    path.join(process.cwd(), 'temp/results', `${jobId}.csv`)
                ];

                filesToDelete.forEach(f => {
                    if (f && fs.existsSync(f)) {
                        try { fs.unlinkSync(f); } catch (e) { }
                    }
                });

                // Delete job record
                await Job.deleteOne({ jobId });
                logger.info(`Auto-cleaned job: ${jobId}`);
            }

            logger.info(`Successfully cleaned up ${oldJobs.length} old jobs.`);
            return oldJobs.length;

        } catch (error) {
            logger.error('Maintenance Service Error:', error);
            throw error;
        }
    }

    /**
     * Initializes a recurring cleanup task (e.g., daily)
     */
    startScheduledCleanup() {
        // Run once on startup after 1 minute
        setTimeout(() => this.cleanupOldJobs().catch(() => { }), 60000);

        // Run every 24 hours
        setInterval(() => {
            this.cleanupOldJobs().catch(err => {
                logger.error('Scheduled cleanup failed:', err);
            });
        }, 24 * 60 * 60 * 1000);

        logger.info('Maintenance: Scheduled cleanup task initialized (24h interval)');
    }
}

module.exports = new MaintenanceService();
