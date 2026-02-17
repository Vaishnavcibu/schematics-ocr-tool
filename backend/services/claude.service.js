const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../config/logger');

class ClaudeService {
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
        });
        this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620';
    }

    /**
     * Classify a batch of items using Claude AI
     * @param {Array} items - Array of { id, text, pageNumber }
     * @param {Array} headings - Array of target classification headings
     */
    async classifyBatch(items, headings) {
        try {
            console.log(`Classifying batch of ${items.length} items...`);
            const prompt = this.generatePrompt(items, headings);


            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 4096,
                temperature: 0, // Keep it deterministic
                system: "You are a specialized engineering assistant. Your task is to classify text extracted from electronic schematics into pre-defined categories. Return ONLY a JSON object.",
                messages: [{ role: 'user', content: prompt }]
            });

            const resultText = response.content[0].text;
            const parsedResults = this.parseJson(resultText);

            return {
                classifications: parsedResults,
                usage: response.usage
            };

        } catch (error) {
            logger.error('Claude API Error:', error);
            throw error;
        }
    }

    /**
     * Generates a structured prompt for classification
     */
    generatePrompt(items, headings) {
        const itemsList = items.map((item, index) => `${index + 1}. "${item.text}"`).join('\n');
        const headingsList = headings.map(h => `"${h}"`).join(', ');

        return `
Please classify the following ${items.length} text items extracted from an electronic schematic PDF. 
Target Headings: [${headingsList}, "Unclassified"]

Items to classify:
${itemsList}

Return a JSON object where each key is the exact text of the item, and the value is the most appropriate heading from the provided list. 
If an item doesn't fit any heading, use "Unclassified".

Example Response Format:
{
  "TEXT_ITEM_1": "Heading Name",
  "TEXT_ITEM_2": "Unclassified"
}

JSON Result:`;
    }

    /**
     * Safely parses JSON from Claude's response
     */
    parseJson(text) {
        try {
            // Find the first { and last } to handle any preamble/postamble
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error('No valid JSON found in response');

            const jsonStr = text.substring(start, end + 1);
            return JSON.parse(jsonStr);
        } catch (error) {
            logger.error('Failed to parse Claude JSON response:', error);
            throw new Error('Claude returned invalid results');
        }
    }
}

module.exports = new ClaudeService();
