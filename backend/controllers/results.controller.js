const Job = require('../models/job.model');
const ClassifiedResult = require('../models/classifiedResult.model');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');

const getResults = async (req, res) => {
    try {
        const { job_id } = req.params;
        const job = await Job.findOne({ jobId: job_id });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: { code: 'JOB_NOT_FOUND', message: 'Job ID not found' }
            });
        }

        if (job.status.state !== 'completed') {
            return res.status(400).json({
                success: false,
                error: { code: 'JOB_NOT_COMPLETED', message: `Job status is ${job.status.state}` }
            });
        }

        const results = await ClassifiedResult.find({ jobId: job_id }).sort({ heading: 1, text: 1 });

        // Format results by heading
        const formattedResults = results.reduce((acc, curr) => {
            if (!acc[curr.heading]) acc[curr.heading] = [];
            acc[curr.heading].push({
                id: curr._id,
                text: curr.text,
                page: curr.pageNumber,
                isEdited: curr.edits.isEdited
            });
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                job_id: job.jobId,
                filename: job.filename,
                stats: job.stats,
                results: formattedResults
            }
        });

    } catch (error) {
        logger.error('Get results error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred while fetching results' }
        });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { job_id, format } = req.params;
        const allowedFormats = ['json', 'csv', 'xlsx'];

        if (!allowedFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_FORMAT', message: 'Allowed formats: json, csv, xlsx' }
            });
        }

        const filePath = path.join(process.cwd(), 'temp/results', `${job_id}.${format}`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: { code: 'FILE_NOT_FOUND', message: 'Requested export file not found' }
            });
        }

        res.download(filePath, `extraction_results_${job_id}.${format}`);

    } catch (error) {
        logger.error('Download file error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred while preparing the download' }
        });
    }
};

module.exports = {
    getResults,
    downloadFile
};
