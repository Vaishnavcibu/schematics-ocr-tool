const Job = require('../models/job.model');
const ocrService = require('./ocr.service');
const cleanupService = require('./cleanup.service');
const claudeService = require('./claude.service');
const exportService = require('./export.service');
const logger = require('../config/logger');
const ClassifiedResult = require('../models/classifiedResult.model');
const ExtractedItem = require('../models/extractedItem.model');

class JobProcessor {
    /**
     * Orchestrates the entire job pipeline
     */
    async processJob(jobId) {
        const startTime = Date.now();

        try {
            // 1. Initialize Job
            const job = await Job.findOne({ jobId });
            if (!job) throw new Error('Job not found');

            await this.updateJobStatus(jobId, 'processing', 'ocr', 10);
            logger.info(`Starting pipeline for Job: ${jobId}`);

            // 2. Stage: OCR Extraction
            const extractedCount = await ocrService.extractText(jobId, job.paths.pdfPath);
            await this.updateJobStatus(jobId, 'processing', 'dedup', 30, {
                'stats.totalExtracted': extractedCount
            });

            // 3 & 4. Stage: Deduplication & Filtering
            logger.info(`Job ${jobId}: Cleanup and Filtering stage...`);
            const cleanupResults = await cleanupService.cleanAndFilter(jobId, job.config);

            const itemsAfterFilter = extractedCount - cleanupResults.duplicatesRemoved - cleanupResults.filteredCount;

            await this.updateJobStatus(jobId, 'processing', 'classify', 50, {
                'stats.duplicatesRemoved': cleanupResults.duplicatesRemoved,
                'stats.filteredCount': cleanupResults.filteredCount,
                'stats.itemsAfterFilter': itemsAfterFilter
            });

            // 5. Stage: AI Classification
            logger.info(`Job ${jobId}: AI Classification stage...`);

            const filteredItems = await ExtractedItem.find({
                jobId,
                'flags.isDuplicate': false,
                'flags.isFiltered': false
            });

            if (filteredItems.length > 0) {
                const batchSize = 50;
                let processedCount = 0;

                for (let i = 0; i < filteredItems.length; i += batchSize) {
                    const batch = filteredItems.slice(i, i + batchSize);
                    const progressRange = 40; // From 50% to 90%
                    const currentProgress = 50 + Math.floor((i / filteredItems.length) * progressRange);

                    await this.updateJobStatus(jobId, 'processing', 'classify', currentProgress);

                    const { classifications, usage } = await claudeService.classifyBatch(batch, job.config.mainHeadings);

                    const resultsToSave = batch.map(item => ({
                        jobId,
                        extractedItemId: item._id,
                        text: item.text,
                        pageNumber: item.pageNumber,
                        heading: classifications[item.text] || 'Unclassified',
                        classification: {
                            model: claudeService.model,
                            tokensUsed: Math.ceil(usage.input_tokens / batch.length) + Math.ceil(usage.output_tokens / batch.length),
                            timestamp: new Date()
                        }
                    }));

                    await ClassifiedResult.insertMany(resultsToSave);
                    processedCount += batch.length;
                }

                const classifiedCount = await ClassifiedResult.countDocuments({ jobId, heading: { $ne: 'Unclassified' } });
                const unclassifiedCount = processedCount - classifiedCount;

                // Stage: Exporting Files
                logger.info(`Job ${jobId}: Generating export files...`);
                try {
                    await exportService.generateJson(jobId);
                    await exportService.generateExcel(jobId);
                    await exportService.generateCsv(jobId);
                } catch (exportErr) {
                    logger.error(`Export generation failed for job ${jobId}:`, exportErr);
                }

                await this.updateJobStatus(jobId, 'completed', 'export', 100, {
                    'stats.classifiedCount': classifiedCount,
                    'stats.unclassifiedCount': unclassifiedCount,
                    'timestamps.completedAt': new Date(),
                    'timestamps.processingTimeSeconds': Math.floor((Date.now() - startTime) / 1000),
                    'paths.resultJsonPath': `./temp/results/${jobId}.json`
                });
            } else {
                await this.updateJobStatus(jobId, 'completed', 'export', 100, {
                    'timestamps.completedAt': new Date(),
                    'timestamps.processingTimeSeconds': Math.floor((Date.now() - startTime) / 1000)
                });
            }

            logger.info(`✅ Job ${jobId} completed successfully in ${Math.floor((Date.now() - startTime) / 1000)}s`);

        } catch (error) {
            logger.error(`❌ Job ${jobId} failed:`, error);
            await Job.findOneAndUpdate({ jobId }, {
                'status.state': 'failed',
                'status.errorMessage': error.message,
                'status.errorStage': 'processing' // Specific stage should be passed in a real scenario
            });
        }
    }

    /**
     * Helper to update job status in DB
     */
    async updateJobStatus(jobId, state, stage, progress, extraData = {}) {
        await Job.findOneAndUpdate(
            { jobId },
            {
                'status.state': state,
                'status.stage': stage,
                'status.progress': progress,
                ...extraData
            }
        );
    }
}

module.exports = new JobProcessor();
