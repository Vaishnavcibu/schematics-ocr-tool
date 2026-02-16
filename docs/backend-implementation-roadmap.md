# Backend Implementation Roadmap (Node.js + MongoDB)
## Schematic OCR Extraction Tool

This roadmap outlines the specific steps to build the complete backend logic for the Schematic OCR Tool.

---

## Phase 1: OCR & Text Extraction (The Foundation)
**Goal:** Convert PDF pages to structured text data.

1. **OCR Service (`services/ocr.service.js`)**
   - Initialize Tesseract.js worker with `eng` language.
   - Implement `extractTextFromPDF` using `pdf-parse` or `pdf2pic` to convert PDF pages to images for Tesseract.
   - Extract text with confidence scores and bounding boxes.
   - Save raw results to the `ExtractedItems` collection in MongoDB.

2. **Progress Updates**
   - Update `Job` status in MongoDB after each page is processed.
   - Emit progress percentages for the frontend.

---

## Phase 2: Data Cleaning & Filtering (The Logic)
**Goal:** Remove noise and keep only relevant schematic data.

1. **Deduplication Service (`services/cleanup.service.js`)**
   - Implement exact string matching to flag duplicates.
   - Use a Hash Set (MD5) for high-performance comparison across thousands of items.

2. **Pattern Filtering logic**
   - Implement Wildcard matching (e.g., `TP*`, `R*`).
   - Implement Regex matching (if enabled in job config).
   - Filter out items that match user-defined Test Point and Component filters.

3. **Status: `items_filtered`**
   - Finalize the set of items ready for AI classification.

---

## Phase 3: AI Intelligence (The Brain)
**Goal:** Intelligently classify filtered text using Claude AI.

1. **Claude Service (`services/claude.service.js`)**
   - Integrate `@anthropic-ai/sdk`.
   - Design professional system prompts for schematic classification.
   - Implement Batching logic: Send items in groups of 50-100 to optimize API costs and tokens.

2. **Classification Logic**
   - Parse Claude's JSON response.
   - Store results in `ClassifiedResults` collection.
   - Implement "Unclassified" bucket for items the AI isn't sure about.
   - Confidence scoring based on Claude's output.

3. **Retry & Backoff Service**
   - Handle rate limits (429 errors) with exponential backoff.
   - Ensure job completion even if API is temporarily unavailable.

---

## Phase 4: Job Execution Engine (The Orchestrator)
**Goal:** Seamlessly move jobs through the pipeline.

1. **Job Processor (`services/processor.js`)**
   - Create an async function `processJob(jobId)` that runs:
     - `OCR -> Deduplicate -> Filter -> Classify -> Export`.
   - Handle errors at each stage and update the `errorMessage` in MongoDB.

2. **Status Polling Support**
   - Ensure all stages update the `Job.status` object for real-time frontend feedback.

---

## Phase 5: Export & Reporting (The Output)
**Goal:** Generate final reports in requested formats.

1. **Export Service (`services/export.service.js`)**
   - **JSON**: Full hierarchical export of all classified data.
   - **CSV**: Flat file for spreadsheet use.
   - **XLSX**: Using `exceljs` to create a multi-sheet, formatted Excel file with:
     - Summary Tab (Stats)
     - Tabs for each Heading (Power, CPU, etc.)

2. **Result Retrieval API**
   - `GET /api/results/:job_id`: Fetch final classified results.
   - `GET /api/export/:job_id/:format`: Download specific file types.

---

## Phase 6: History & Management (The Dashboard)
**Goal:** Manage past jobs and system settings.

1. **History APIs (`routes/history.routes.js`)**
   - `GET /api/history`: Paginated list of past jobs.
   - `GET /api/history/:job_id`: Detailed view of a specific job results.
   - `DELETE /api/history/:job_id`: Clean up files and DB entries.

2. **Maintenance Service (`services/maintenance.service.js`)**
   - Auto-cleanup for jobs older than 90 days.
   - Temp file deletion after job completion/failure.

---

## Technology Checklist

- [x] Express App + Project Structure
- [x] logging (Winston)
- [x] Database (MongoDB + Mongoose)
- [x] File Upload (Multer)
- [ ] OCR Integration (Tesseract.js)
- [ ] AI Integration (Claude SDK)
- [ ] Filtering Engine
- [ ] Excel Generation (ExcelJS)
- [ ] Cleanup & Maintenance Services
