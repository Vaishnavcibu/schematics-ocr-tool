const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const ClassifiedResult = require('../models/classifiedResult.model');
const Job = require('../models/job.model');

class ExportService {
    /**
     * Generates a JSON export of the job results
     * @param {string} jobId 
     */
    async generateJson(jobId) {
        try {
            const job = await Job.findOne({ jobId });
            const results = await ClassifiedResult.find({ jobId }).sort({ heading: 1, text: 1 });

            const exportData = {
                job_metadata: {
                    job_id: job.jobId,
                    filename: job.filename,
                    processed_at: job.timestamps.completedAt,
                    stats: job.stats
                },
                results: results.reduce((acc, curr) => {
                    if (!acc[curr.heading]) acc[curr.heading] = [];
                    acc[curr.heading].push({
                        text: curr.text,
                        page: curr.pageNumber,
                        confidence: curr.classification.score
                    });
                    return acc;
                }, {})
            };

            const filePath = path.join(process.cwd(), 'temp/results', `${jobId}.json`);
            fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
            return filePath;
        } catch (error) {
            logger.error('JSON Export Error:', error);
            throw error;
        }
    }

    /**
     * Generates an Excel export with multiple sheets
     * @param {string} jobId 
     */
    async generateExcel(jobId) {
        try {
            const job = await Job.findOne({ jobId });
            const results = await ClassifiedResult.find({ jobId }).sort({ heading: 1 });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Schematic OCR Tool';
            workbook.lastModifiedBy = 'Schematic OCR Tool';
            workbook.created = new Date();

            // 1. Summary Sheet
            const summarySheet = workbook.addWorksheet('Summary');
            summarySheet.columns = [
                { header: 'Metric', key: 'metric', width: 25 },
                { header: 'Value', key: 'value', width: 50 }
            ];

            summarySheet.addRows([
                { metric: 'File Name', value: job.filename },
                { metric: 'Job ID', value: job.jobId },
                { metric: 'Processed Date', value: job.timestamps.completedAt },
                { metric: 'Total Extracted', value: job.stats.totalExtracted },
                { metric: 'Classified Items', value: job.stats.classifiedCount },
                { metric: 'Unclassified Items', value: job.stats.unclassifiedCount }
            ]);

            summarySheet.getRow(1).font = { bold: true };
            summarySheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2572B' } // Premium Orange
            };
            summarySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

            // 2. Headings Sheets
            const groupedResults = results.reduce((acc, curr) => {
                if (!acc[curr.heading]) acc[curr.heading] = [];
                acc[curr.heading].push(curr);
                return acc;
            }, {});

            for (const heading of Object.keys(groupedResults)) {
                // Excel worksheet names have a 31 char limit and cannot contain certain chars
                const sheetName = heading.substring(0, 31).replace(/[\[\]\?\*\\\/]/g, '');
                const sheet = workbook.addWorksheet(sheetName);

                sheet.columns = [
                    { header: 'Extracted Text', key: 'text', width: 60 },
                    { header: 'Page', key: 'page', width: 10 },
                    { header: 'Confidence', key: 'confidence', width: 15 }
                ];

                groupedResults[heading].forEach(item => {
                    sheet.addRow({
                        text: item.text,
                        page: item.pageNumber,
                        confidence: item.classification.score || 'N/A'
                    });
                });

                sheet.getRow(1).font = { bold: true };
            }

            const filePath = path.join(process.cwd(), 'temp/results', `${jobId}.xlsx`);
            await workbook.xlsx.writeFile(filePath);
            return filePath;
        } catch (error) {
            logger.error('Excel Export Error:', error);
            throw error;
        }
    }

    /**
     * Generates a CSV export
     * @param {string} jobId 
     */
    async generateCsv(jobId) {
        try {
            const results = await ClassifiedResult.find({ jobId }).sort({ heading: 1, text: 1 });

            let csvContent = "Heading,Text,Page\n";
            results.forEach(item => {
                const cleanText = item.text.replace(/"/g, '""');
                csvContent += `"${item.heading}","${cleanText}",${item.pageNumber}\n`;
            });

            const filePath = path.join(process.cwd(), 'temp/results', `${jobId}.csv`);
            fs.writeFileSync(filePath, csvContent);
            return filePath;
        } catch (error) {
            logger.error('CSV Export Error:', error);
            throw error;
        }
    }
}

module.exports = new ExportService();
