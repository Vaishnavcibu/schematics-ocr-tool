# Quick Reference Guide
## Schematic OCR Extraction Tool

---

## 📋 Project Overview

**Purpose:** Cross-platform OCR tool for extracting and classifying text from PDF schematics  
**Tech Stack:** Node.js (Backend) + Flutter (Frontend)  
**AI Integration:** Claude Sonnet 4 for intelligent classification  
**Platforms:** Web, Windows, macOS, Linux, iOS, Android

---

## 🚀 Quick Start

### Prerequisites
```bash
# Backend
Node.js v18+
npm or yarn

# Frontend
Flutter 3.16+
Dart 3.2+

# External Services
Anthropic Claude API key
```

### Setup Commands
```bash
# Clone repository
git clone <repository-url>
cd schematics-ocr-tool

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY
npm run dev

# Frontend setup (in new terminal)
cd frontend
flutter pub get
flutter run -d chrome  # For web
flutter run -d windows # For desktop
```

---

## 📁 Project Structure

```
schematics-ocr-tool/
├── backend/                      # Node.js backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.ts      # Database configuration
│   │   │   ├── logger.ts        # Winston logger setup
│   │   │   └── env.ts           # Environment variables
│   │   ├── controllers/         # API controllers
│   │   │   ├── upload.controller.ts
│   │   │   ├── status.controller.ts
│   │   │   ├── result.controller.ts
│   │   │   ├── history.controller.ts
│   │   │   └── export.controller.ts
│   │   ├── services/            # Business logic
│   │   │   ├── ocr.service.ts
│   │   │   ├── claude.service.ts
│   │   │   ├── filter.service.ts
│   │   │   ├── export.service.ts
│   │   │   ├── job.service.ts
│   │   │   └── database.service.ts
│   │   ├── models/              # Data models
│   │   │   ├── job.model.ts
│   │   │   ├── extracted-item.model.ts
│   │   │   └── classified-item.model.ts
│   │   ├── routes/              # API routes
│   │   │   ├── api.routes.ts
│   │   │   └── index.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── utils/               # Utility functions
│   │   │   ├── hash.util.ts
│   │   │   ├── pattern.util.ts
│   │   │   └── time.util.ts
│   │   ├── types/               # TypeScript types
│   │   │   ├── job.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── claude.types.ts
│   │   └── index.ts             # Entry point
│   ├── database/                # SQLite database
│   │   ├── schema.sql           # Database schema
│   │   ├── migrations/          # Migration scripts
│   │   └── app.db               # SQLite database file
│   ├── temp/                    # Temporary files
│   │   ├── uploads/             # Uploaded PDFs
│   │   └── results/             # Generated exports
│   ├── logs/                    # Application logs
│   ├── tests/                   # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example             # Environment template
│   ├── .env                     # Environment variables (gitignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                    # Flutter frontend
│   ├── lib/
│   │   ├── core/               # Core functionality
│   │   │   ├── theme/
│   │   │   │   ├── app_theme.dart
│   │   │   │   ├── app_colors.dart
│   │   │   │   ├── app_typography.dart
│   │   │   │   └── app_animations.dart
│   │   │   ├── constants/
│   │   │   │   ├── api_constants.dart
│   │   │   │   ├── app_constants.dart
│   │   │   │   └── route_constants.dart
│   │   │   ├── utils/
│   │   │   │   ├── validators.dart
│   │   │   │   ├── formatters.dart
│   │   │   │   └── helpers.dart
│   │   │   └── widgets/
│   │   │       ├── custom_button.dart
│   │   │       ├── custom_input.dart
│   │   │       ├── loading_indicator.dart
│   │   │       └── error_widget.dart
│   │   ├── features/           # Feature modules
│   │   │   ├── configuration/
│   │   │   │   ├── screens/
│   │   │   │   │   └── configuration_screen.dart
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── file_upload_widget.dart
│   │   │   │   │   ├── headings_input.dart
│   │   │   │   │   └── filter_input.dart
│   │   │   │   └── providers/
│   │   │   │       └── configuration_provider.dart
│   │   │   ├── processing/
│   │   │   │   ├── screens/
│   │   │   │   │   └── processing_screen.dart
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── progress_circle.dart
│   │   │   │   │   └── stage_indicator.dart
│   │   │   │   └── providers/
│   │   │   │       └── processing_provider.dart
│   │   │   ├── results/
│   │   │   │   ├── screens/
│   │   │   │   │   └── results_screen.dart
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── statistics_card.dart
│   │   │   │   │   ├── heading_accordion.dart
│   │   │   │   │   └── item_list.dart
│   │   │   │   └── providers/
│   │   │   │       └── results_provider.dart
│   │   │   └── history/
│   │   │       ├── screens/
│   │   │       │   └── history_screen.dart
│   │   │       ├── widgets/
│   │   │       │   ├── history_card.dart
│   │   │       │   └── search_bar.dart
│   │   │       └── providers/
│   │   │           └── history_provider.dart
│   │   ├── models/             # Data models
│   │   │   ├── job.dart
│   │   │   ├── job_result.dart
│   │   │   ├── classified_item.dart
│   │   │   └── api_response.dart
│   │   ├── services/           # API & Storage services
│   │   │   ├── api_service.dart
│   │   │   ├── database_service.dart
│   │   │   └── file_service.dart
│   │   ├── providers/          # Global providers
│   │   │   └── app_provider.dart
│   │   └── main.dart           # Entry point
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── test/                   # Test files
│   ├── pubspec.yaml
│   └── README.md
│
├── docs/                       # Documentation
│   ├── prd.md                  # Product Requirements
│   ├── ui-design-specification.md
│   ├── backend-schema-structures.md
│   ├── system-architecture.md
│   ├── implementation-plan.md
│   ├── api-documentation.md
│   └── user-guide.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔌 API Endpoints

### Upload
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: PDF file
- mainHeadings: string[]
- testPointFilters: string[] (optional)
- componentFilters: string[] (optional)
- regexMode: boolean (optional)

Response:
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "pending"
  }
}
```

### Status
```http
GET /api/status/:job_id

Response:
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "processing",
    "current_stage": "classification",
    "progress": 67,
    "estimated_time_remaining_seconds": 180
  }
}
```

### Result
```http
GET /api/result/:job_id

Response:
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "completed",
    "result": { /* Full JSON structure */ }
  }
}
```

### History
```http
GET /api/history?page=1&limit=10&status=completed

Response:
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5
    }
  }
}
```

### Export
```http
GET /api/export/:job_id?format=json|csv|xlsx

Response: File download
```

### Cancel
```http
POST /api/cancel/:job_id

Response:
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

### Delete
```http
DELETE /api/history/:id

Response:
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## 🗄️ Database Tables

### jobs
```sql
id, filename, file_size, file_hash, main_headings, 
test_point_filters, component_filters, regex_mode,
status, current_stage, progress, created_at, started_at,
completed_at, processing_time_seconds, total_extracted_items,
duplicates_removed, items_after_filter, classified_items,
unclassified_items, pages_processed, error_message,
error_stage, retry_count, pdf_path, result_json_path,
user_agent, deleted_at
```

### extracted_items
```sql
id, job_id, text, page_number, is_duplicate,
is_filtered, filter_reason, confidence, bounding_box,
created_at
```

### classified_items
```sql
id, job_id, extracted_item_id, text, page_number,
heading, confidence_level, classification_score,
claude_model, claude_tokens_used, classification_timestamp,
manually_edited, original_heading, edited_at
```

### processing_logs
```sql
id, job_id, stage, level, message, details, timestamp
```

### api_usage
```sql
id, job_id, model, request_type, input_tokens,
output_tokens, total_tokens, estimated_cost_usd,
response_time_ms, retry_count, status, error_message,
timestamp
```

### settings
```sql
key, value, value_type, description, updated_at
```

---

## 🎨 UI Screens

### 1. Configuration Screen
- File upload (drag-drop)
- Main headings input
- Test point filters
- Component filters
- Regex mode toggle
- Start processing button

### 2. Processing Screen
- Circular progress indicator
- Current stage display
- Estimated time remaining
- Stage-by-stage status
- Cancel button

### 3. Results Screen
- Statistics cards
- Expandable heading sections
- Item preview (first 10)
- Download/Export buttons
- Manual editing capability

### 4. History Screen
- Search bar
- Filter options
- Job list with cards
- View/Download/Delete actions
- Pagination

---

## ⚙️ Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Claude API
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250929
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.3

# File Upload
MAX_FILE_SIZE_MB=20
UPLOAD_DIR=./temp/uploads
RESULTS_DIR=./temp/results

# Database
DATABASE_PATH=./database/app.db
RETENTION_DAYS=90

# OCR Configuration
TESSERACT_LANG=eng
OCR_CONFIDENCE_THRESHOLD=0.5

# Processing
CLASSIFICATION_BATCH_SIZE=100
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=2000

# Rate Limiting
MAX_DAILY_JOBS=100
RATE_LIMIT_WINDOW_MS=86400000

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# CORS
CORS_ORIGIN=http://localhost:8080
```

---

## 🧪 Testing Commands

### Backend
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend
```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test
flutter test test/widget_test.dart

# Integration tests
flutter drive --target=test_driver/app.dart
```

---

## 🚀 Build Commands

### Backend
```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Lint
npm run lint

# Format
npm run format
```

### Frontend
```bash
# Web
flutter build web --release

# Windows
flutter build windows --release

# macOS
flutter build macos --release

# Linux
flutter build linux --release

# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

---

## 📊 Processing Pipeline

```
1. Upload PDF (0%)
   ↓
2. OCR Extraction (0-40%)
   ↓
3. Deduplication (40-50%)
   ↓
4. Pattern Filtering (50-60%)
   ↓
5. AI Classification (60-90%)
   ↓
6. Export Generation (90-100%)
   ↓
7. Cleanup & Complete
```

---

## 🔍 Common Patterns

### Wildcard Patterns
```
TP*        - Matches TP1, TP2, TP100, etc.
TEST*      - Matches TEST1, TESTPOINT, etc.
*GND       - Matches GND, DGND, AGND, etc.
R*         - Matches R1, R100, RESISTOR, etc.
IC*        - Matches IC1, IC2, etc.
```

### Regex Patterns
```
^TP\d+$    - Matches TP followed by digits only
^R\d{4}$   - Matches R followed by exactly 4 digits
^IC[0-9]+$ - Matches IC followed by numbers
```

---

## 🐛 Error Codes

### Validation Errors (400)
- `VALIDATION_ERROR` - General validation failure
- `INVALID_FILE_TYPE` - Not a PDF file
- `FILE_TOO_LARGE` - Exceeds 20MB limit
- `MISSING_REQUIRED_FIELD` - Required field missing

### Processing Errors (422)
- `OCR_FAILED` - OCR extraction failed
- `NO_TEXT_DETECTED` - PDF contains no text
- `CORRUPTED_PDF` - PDF file is corrupted

### API Errors (502/503)
- `CLAUDE_API_ERROR` - Claude API failure
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `API_TIMEOUT` - API request timeout

### System Errors (500)
- `INTERNAL_SERVER_ERROR` - Server error
- `DATABASE_ERROR` - Database operation failed
- `FILE_SYSTEM_ERROR` - File operation failed

### Not Found (404)
- `JOB_NOT_FOUND` - Job ID not found
- `RESULT_NOT_FOUND` - Result not available

---

## 📈 Performance Targets

- **Processing Time:** <10 min for 20MB, 100-page PDF
- **Average Time:** <7 min
- **Capacity:** 100 PDFs/day
- **Database Queries:** <2s for history retrieval
- **UI Responsiveness:** 60fps, non-blocking
- **Success Rate:** >95%
- **Duplicate Removal:** >90% accuracy
- **Classification Accuracy:** >85%
- **Error Rate:** <5%

---

## 🔐 Security Checklist

- [ ] API key stored in environment variables
- [ ] No secrets in client code
- [ ] File type validation
- [ ] File size limits enforced
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Database encryption at rest
- [ ] Secure file deletion
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive data
- [ ] Logging excludes sensitive information

---

## 📝 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
# Write tests
# Run tests
npm test

# Commit
git commit -m "feat: add feature description"

# Push
git push origin feature/feature-name

# Create pull request
```

### 2. Code Review
- Check code quality
- Verify tests pass
- Review documentation
- Test manually

### 3. Merge & Deploy
```bash
# Merge to main
git checkout main
git merge feature/feature-name

# Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags

# Deploy
npm run build
npm start
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check Node.js version
node --version  # Should be v18+

# Check environment variables
cat .env

# Check port availability
netstat -ano | findstr :3000

# Check logs
tail -f logs/error.log
```

### OCR not working
```bash
# Check Tesseract installation
tesseract --version

# Check language data
tesseract --list-langs

# Test with sample PDF
# Check logs for OCR errors
```

### Claude API errors
```bash
# Verify API key
echo $CLAUDE_API_KEY

# Check API status
curl https://status.anthropic.com

# Review API usage logs
cat logs/api-usage.log

# Check rate limits
```

### Flutter build fails
```bash
# Clean build
flutter clean
flutter pub get

# Check Flutter version
flutter --version

# Check for platform-specific issues
flutter doctor

# Rebuild
flutter build <platform>
```

---

## 📚 Useful Resources

### Documentation
- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [Flutter Docs](https://docs.flutter.dev)
- [Tesseract.js](https://tesseract.projectnaptha.com)
- [Claude API Docs](https://docs.anthropic.com)

### Tools
- [Postman](https://www.postman.com) - API testing
- [DB Browser for SQLite](https://sqlitebrowser.org) - Database viewer
- [VS Code](https://code.visualstudio.com) - IDE

---

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review detailed documentation in `/docs`
3. Check logs in `/logs` directory
4. Review error codes above
5. Create an issue in the repository

---

**Last Updated:** February 16, 2026  
**Version:** 1.0
