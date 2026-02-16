Product Requirements Document (PRD)
Schematic OCR Extraction Tool
Version: 1.0
Date: February 16, 2026

Executive Summary
You're building a cross-platform OCR extraction tool that processes PDF schematics using Tesseract OCR and Claude Sonnet 4 AI for intelligent classification. The tool will:

Accept PDF files (up to 20MB, ~100/day capacity)
Extract text via Tesseract on Node.js backend
Remove exact duplicates
Filter test points and components via separate pattern inputs
Classify extracted text under user-defined headings using Claude API
Output structured JSON with optional database storage
Run on Web, Desktop (Windows/Mac/Linux), and Mobile (iOS/Android)
Process in batch mode (5-10 minutes per file)
Single-user operation (no login required)


Key Requirements Summary
Inputs (User Configuration Screen)

PDF Upload: Drag-drop or browse (20MB max)
Main Headings: Multi-line text box (comma or line-separated, no limits/validation)
Test Point Filters: Separate text box (e.g., TP*, TEST*)
Component Filters: Separate text box (e.g., R5001, IC*, U*)
Regex Mode: Toggle for advanced pattern matching

Processing Pipeline (Node.js Backend)

OCR → Tesseract extracts text from all pages (combined dataset)
Deduplication → Remove exact string matches (case-sensitive)
Pattern Filtering → Apply test point & component filters
Claude Classification → Batch API calls to classify text under one heading each

Model: claude-sonnet-4-20250929
Centralized API key
Retry: 3 attempts (2s, 4s, 8s delays)
Unmatched text → "Unclassified" category


JSON Generation → Structured output with metadata

Outputs

JSON Download: Primary export format
Database Storage: SQLite (Desktop/Mobile) or IndexedDB (Web)

90-day auto-cleanup
Processing history with search/filter


Additional Exports: CSV, Excel (.xlsx) with formatting

JSON Structure
json{
  "metadata": {
    "filename": "schematic.pdf",
    "processed_date": "2026-02-16T10:30:00Z",
    "total_extracted_items": 15420,
    "duplicates_removed": 8200,
    "filters_applied": {
      "test_points": ["TP*", "TEST*"],
      "components": ["R5001", "IC*"]
    },
    "main_headings": ["Power Supply", "CPU Section"],
    "processing_time_seconds": 456,
    "pages_processed": 45
  },
  "classified_data": {
    "Power Supply": [
      {"text": "VCC 3.3V Rail", "page": 5, "confidence": "high"}
    ],
    "CPU Section": [...],
    "Unclassified": [...]
  },
  "statistics": {
    "items_per_heading": {"Power Supply": 234, ...},
    "total_items": 969
  }
}
```

---

## **Technical Architecture**

### **Technology Stack**

**Backend (Node.js):**
- Runtime: Node.js v18+
- Framework: Express.js
- OCR: Tesseract.js or tesseract-ocr
- PDF: pdf-parse or pdf2pic
- AI: @anthropic-ai/sdk
- Database: SQLite3 / better-sqlite3
- Upload: Multer
- Validation: Joi
- Logging: Winston

**Frontend (Flutter):**
- Framework: Flutter 3.16+
- State: Riverpod or Provider
- HTTP: Dio
- Storage: sqflite (mobile/desktop), IndexedDB (web)
- File Picker: file_picker
- UI: Material Design 3

### **System Diagram**
```
Flutter UI (Web/Desktop/Mobile)
    ↓ Upload PDF + Config
Node.js Backend
    ↓ OCR → Dedupe → Filter → Claude API → JSON
Local Database (History)
    ↓ Download/Export
User Gets Files
API Endpoints

POST /api/upload - Upload PDF & start job
GET /api/status/:job_id - Poll processing status
GET /api/result/:job_id - Retrieve results
POST /api/cancel/:job_id - Cancel job
GET /api/history - List past jobs
DELETE /api/history/:id - Delete history
GET /api/export/:job_id?format=json|csv|xlsx - Export file

Processing Split
Node.js:

PDF validation & OCR
Duplicate removal
Pattern filtering
Claude API calls (batched, 50-100 items/call)
Export generation (JSON/CSV/Excel)
Temp file cleanup

Flutter:

UI rendering & user input
File upload & polling (2s intervals)
Local database (history)
Results preview with manual editing
Download handling
Error notifications


User Interface Flow
Screen 1: Configuration

File upload area (drag-drop)
Main headings input (multi-line text)
Test points filter (text box)
Components filter (text box)
Regex toggle
"Start Processing" button

Screen 2: Processing

Progress bar (%)
Current stage indicator
Est. time remaining
Cancel button

Screen 3: Results

Summary statistics
Preview (expandable per heading, first 10 items)
Manual edit capability
Download JSON button
Export CSV/Excel buttons
"Process Another" button

Screen 4: History

List of past files (searchable)
View/Download/Delete actions
Bulk delete option


Development Timeline (10 Weeks)

Weeks 1-3: Backend core (OCR, filtering, job queue)
Weeks 3-4: Claude integration (batching, retry logic)
Weeks 4-5: JSON/CSV/Excel export
Weeks 5-6: Flutter config screen
Weeks 6-7: Flutter processing & results screens
Weeks 7-8: Database & history
Weeks 8-9: Cross-platform testing
Weeks 9-10: Documentation & deployment


Key Performance Requirements

Processing Time: <10 min for 20MB, 100-page PDF
Capacity: 100 PDFs/day
Database Queries: <2s for history retrieval
UI: Non-blocking, responsive during processing
Retry Logic: 3 attempts with exponential backoff
Storage: 90-day auto-cleanup


Security & Data Handling

Claude API key: Environment variable (never in client code)
PDFs deleted after processing
Database encryption at rest
No external data transmission except Claude API
Local-only operation (no cloud sync)


Error Handling

Corrupted PDF: "Unable to process. File may be corrupted."
No text detected: "PDF may contain only images."
Claude API failure: Show error, allow manual retry
Network issues: Display with retry option
Logging: Local debug logs


Success Metrics

95%+ processing success rate
90%+ duplicate removal accuracy
85%+ Claude classification accuracy
<7 min avg processing time
<5% error rate