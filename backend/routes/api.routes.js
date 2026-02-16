const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { validateUpload } = require('../middleware/validation.middleware');
const uploadController = require('../controllers/upload.controller');
const resultsController = require('../controllers/results.controller');
const historyController = require('../controllers/history.controller');
const Job = require('../models/job.model');

// Job Routes
router.post('/upload', upload.single('file'), validateUpload, uploadController.uploadFile);

// Status Routes
router.get('/status/:job_id', async (req, res) => {
    try {
        const job = await Job.findOne({ jobId: req.params.job_id });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: { code: 'JOB_NOT_FOUND', message: 'Job ID not found' }
            });
        }

        res.json({
            success: true,
            data: {
                job_id: job.jobId,
                status: job.status.state,
                current_stage: job.status.stage,
                progress: job.status.progress,
                estimated_time_remaining_seconds: 180
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
        });
    }
});

// Results Routes
router.get('/results/:job_id', resultsController.getResults);
router.get('/download/:job_id/:format', resultsController.downloadFile);

// History Routes
router.get('/history', historyController.getHistory);
router.delete('/history/:job_id', historyController.deleteJob);

module.exports = router;
