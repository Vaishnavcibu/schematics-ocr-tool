const crypto = require('crypto');
const logger = require('../config/logger');
const ExtractedItem = require('../models/extractedItem.model');

class CleanupService {
    /**
     * Main service to clean and filter extracted items
     * @param {string} jobId - The Job ID
     * @param {Object} config - The job configuration (headings, filters, regexMode)
     */
    async cleanAndFilter(jobId, config) {
        try {
            logger.info(`Starting cleanup and filtering for Job: ${jobId}`);

            const items = await ExtractedItem.find({ jobId });
            if (items.length === 0) return { duplicates: 0, filtered: 0 };

            let duplicatesRemoved = 0;
            let filteredCount = 0;

            // 1. Deduplication using a Hash Set
            const seenHashes = new Set();
            const { testPointFilters, componentFilters, regexMode } = config;

            // Prepare filters as Regexes if not in regexMode (convert wildcards)
            const tpRegexes = testPointFilters.map(f => this.patternToRegex(f, regexMode));
            const compRegexes = componentFilters.map(f => this.patternToRegex(f, regexMode));

            for (const item of items) {
                const cleanText = item.text.trim();
                const hash = crypto.createHash('md5').update(cleanText).digest('hex');

                let isDuplicate = false;
                let isFiltered = false;
                let filterReason = null;

                // Check Duplicates
                if (seenHashes.has(hash)) {
                    isDuplicate = true;
                    duplicatesRemoved++;
                } else {
                    seenHashes.add(hash);
                }

                // Check Filters (if not already a duplicate)
                if (!isDuplicate) {
                    // Check Test Points
                    if (this.matchesAny(cleanText, tpRegexes)) {
                        isFiltered = true;
                        filterReason = 'test_point';
                    }
                    // Check Components
                    else if (this.matchesAny(cleanText, compRegexes)) {
                        isFiltered = true;
                        filterReason = 'component';
                    }

                    if (isFiltered) filteredCount++;
                }

                // Update item in database
                if (isDuplicate || isFiltered) {
                    await ExtractedItem.findByIdAndUpdate(item._id, {
                        'flags.isDuplicate': isDuplicate,
                        'flags.isFiltered': isFiltered,
                        'flags.filterReason': filterReason
                    });
                }
            }

            logger.info(`Cleanup complete for Job ${jobId}: Removed ${duplicatesRemoved} duplicates, Filtered ${filteredCount} items.`);
            return { duplicatesRemoved, filteredCount };

        } catch (error) {
            logger.error('Cleanup Service Error:', error);
            throw error;
        }
    }

    /**
     * Converts a wildcard pattern (e.g. TP*) to a Regex or returns the string as Regex
     */
    patternToRegex(pattern, isRegexMode) {
        if (!pattern) return null;
        try {
            if (isRegexMode) {
                return new RegExp(pattern, 'i');
            } else {
                // Convert wildcard * to .* and escape other special chars
                const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
                return new RegExp(`^${escaped}$`, 'i');
            }
        } catch (e) {
            logger.warn(`Invalid pattern skipped: ${pattern}`);
            return null;
        }
    }

    /**
     * Checks if text matches any of the provided regexes
     */
    matchesAny(text, regexes) {
        return regexes.some(re => re && re.test(text));
    }
}

module.exports = new CleanupService();
