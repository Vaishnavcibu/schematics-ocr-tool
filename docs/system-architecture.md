# System Architecture
## Schematic OCR Extraction Tool

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │ Desktop App  │  │  Mobile App  │          │
│  │  (Flutter)   │  │  (Flutter)   │  │  (Flutter)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            │                                      │
│                     HTTP/REST API                                │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    BACKEND LAYER (Node.js)                        │
│                            │                                      │
│  ┌─────────────────────────▼────────────────────────────┐        │
│  │              Express.js API Server                    │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │        │
│  │  │  Upload  │  │  Status  │  │  Export  │           │        │
│  │  │   API    │  │   API    │  │   API    │           │        │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │        │
│  └───────┼─────────────┼─────────────┼──────────────────┘        │
│          │             │             │                            │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐        │
│  │           Middleware Layer                            │        │
│  │  • Authentication  • Validation  • Error Handling     │        │
│  │  • Rate Limiting   • Logging     • CORS               │        │
│  └───────┬─────────────┬─────────────┬──────────────────┘        │
│          │             │             │                            │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐        │
│  │           Service Layer                               │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │        │
│  │  │   OCR    │  │  Claude  │  │  Export  │           │        │
│  │  │ Service  │  │ Service  │  │ Service  │           │        │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │        │
│  │       │             │             │                   │        │
│  │  ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐           │        │
│  │  │  Filter  │  │   Job    │  │ Database │           │        │
│  │  │ Service  │  │  Queue   │  │ Service  │           │        │
│  │  └──────────┘  └──────────┘  └──────────┘           │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    DATA LAYER                                     │
│                            │                                      │
│  ┌─────────────────────────▼────────────────────────────┐        │
│  │              SQLite Database                          │        │
│  │  • jobs  • extracted_items  • classified_items        │        │
│  │  • processing_logs  • api_usage  • settings           │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────┐        │
│  │              File System                              │        │
│  │  /temp/uploads/     - Uploaded PDFs                   │        │
│  │  /temp/results/     - Generated exports               │        │
│  │  /logs/             - Application logs                │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                  EXTERNAL SERVICES                                │
│                            │                                      │
│  ┌─────────────────────────▼────────────────────────────┐        │
│  │         Anthropic Claude API                          │        │
│  │         (claude-sonnet-4-20250929)                    │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Processing Pipeline Flow

```
┌──────────────┐
│ User Uploads │
│     PDF      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 1. FILE VALIDATION                       │
│    • Check file type (PDF only)          │
│    • Validate size (<20MB)               │
│    • Generate SHA-256 hash               │
│    • Create job record in DB             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 2. OCR EXTRACTION (Tesseract)            │
│    • Process all pages                   │
│    • Extract text with confidence        │
│    • Capture bounding boxes              │
│    • Store in extracted_items table      │
│    • Update progress: 0-40%              │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 3. DEDUPLICATION                         │
│    • Hash-based exact matching           │
│    • Case-sensitive comparison           │
│    • Mark duplicates in DB               │
│    • Update statistics                   │
│    • Update progress: 40-50%             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 4. PATTERN FILTERING                     │
│    • Apply test point filters            │
│    • Apply component filters             │
│    • Support wildcard or regex           │
│    • Mark filtered items in DB           │
│    • Update progress: 50-60%             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 5. AI CLASSIFICATION (Claude)            │
│    • Batch items (100 per call)          │
│    • Send to Claude API                  │
│    • Parse JSON responses                │
│    • Assign headings + confidence        │
│    • Retry on failures (3x)              │
│    • Store in classified_items table     │
│    • Update progress: 60-90%             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 6. EXPORT GENERATION                     │
│    • Generate JSON with metadata         │
│    • Create CSV (on-demand)              │
│    • Create Excel (on-demand)            │
│    • Store file paths in DB              │
│    • Update progress: 90-100%            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ 7. CLEANUP                               │
│    • Delete uploaded PDF                 │
│    • Mark job as completed               │
│    • Send completion notification        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ User Gets    │
│   Results    │
└──────────────┘
```

---

## Component Interaction Diagram

### File Upload Flow
```
Flutter App                Backend                  Database
    │                         │                         │
    │  POST /api/upload       │                         │
    ├────────────────────────>│                         │
    │                         │  Validate file          │
    │                         │  Generate job_id        │
    │                         │  INSERT INTO jobs       │
    │                         ├────────────────────────>│
    │                         │                         │
    │  {job_id, status}       │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │                         │  Add to job queue       │
    │                         │  Start processing       │
    │                         │                         │
```

### Status Polling Flow
```
Flutter App                Backend                  Database
    │                         │                         │
    │  GET /api/status/:id    │                         │
    ├────────────────────────>│                         │
    │                         │  SELECT FROM jobs       │
    │                         ├────────────────────────>│
    │                         │  {status, progress}     │
    │                         │<────────────────────────┤
    │  {status, progress}     │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │  (Wait 2 seconds)       │                         │
    │                         │                         │
    │  GET /api/status/:id    │                         │
    ├────────────────────────>│                         │
    │         ...             │         ...             │
```

### Classification Flow
```
Backend                 Claude API              Database
   │                         │                      │
   │  Batch 100 items        │                      │
   │  Format prompt          │                      │
   │                         │                      │
   │  POST /v1/messages      │                      │
   ├────────────────────────>│                      │
   │                         │  Process request     │
   │                         │  Generate response   │
   │  {classifications}      │                      │
   │<────────────────────────┤                      │
   │                         │                      │
   │  Parse JSON response    │                      │
   │  Map to headings        │                      │
   │                         │                      │
   │  INSERT INTO classified_items                  │
   ├───────────────────────────────────────────────>│
   │  INSERT INTO api_usage                         │
   ├───────────────────────────────────────────────>│
   │                         │                      │
   │  (Repeat for next batch)                       │
   │                         │                      │
```

---

## Data Flow Diagram

```
┌─────────────┐
│  PDF File   │
│  (20MB max) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Raw Text Extraction            │
│  • 15,420 items                 │
│  • Page numbers                 │
│  • Confidence scores            │
│  • Bounding boxes               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Deduplication                  │
│  • Remove 8,200 duplicates      │
│  • Remaining: 7,220 items       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Pattern Filtering              │
│  • Test points: TP*, TEST*      │
│  • Components: R5001, IC*, U*   │
│  • Remaining: 7,220 items       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  AI Classification              │
│  • Power Supply: 234            │
│  • CPU Section: 412             │
│  • Memory Module: 189           │
│  • I/O Interfaces: 6,251        │
│  • Unclassified: 134            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Structured Output              │
│  • JSON (primary)               │
│  • CSV (optional)               │
│  • Excel (optional)             │
└─────────────────────────────────┘
```

---

## Technology Stack Layers

```
┌───────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Flutter Framework (Dart)                           │  │
│  │  • Material Design 3                                │  │
│  │  • Riverpod (State Management)                      │  │
│  │  • Go Router (Navigation)                           │  │
│  │  • Flutter Animate (Animations)                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    API LAYER                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  RESTful API (Express.js)                           │  │
│  │  • Multer (File Upload)                             │  │
│  │  • Joi (Validation)                                 │  │
│  │  • Winston (Logging)                                │  │
│  │  • CORS Middleware                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────┐
│                  BUSINESS LOGIC LAYER                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Services (TypeScript)                              │  │
│  │  • OCR Service (Tesseract.js)                       │  │
│  │  • Classification Service (Claude SDK)              │  │
│  │  • Filter Service (Pattern Matching)               │  │
│  │  • Export Service (JSON/CSV/Excel)                  │  │
│  │  • Job Queue Service (Bull)                         │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    DATA ACCESS LAYER                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Database Service (better-sqlite3)                  │  │
│  │  • Repository Pattern                               │  │
│  │  • Query Builders                                   │  │
│  │  • Transaction Management                           │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    PERSISTENCE LAYER                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  SQLite Database                                    │  │
│  │  • Relational Schema                                │  │
│  │  • Indexes for Performance                          │  │
│  │  • Foreign Key Constraints                          │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  File System                                        │  │
│  │  • Temp Storage (PDFs, Exports)                     │  │
│  │  • Log Files                                        │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                         │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  1. Input Validation                                │  │
│  │     • File type checking                            │  │
│  │     • Size limits (20MB)                            │  │
│  │     • Content validation                            │  │
│  │     • SQL injection prevention                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  2. Authentication & Authorization                  │  │
│  │     • API key management (Claude)                   │  │
│  │     • Environment variable protection               │  │
│  │     • No client-side secrets                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  3. Data Protection                                 │  │
│  │     • Database encryption at rest                   │  │
│  │     • Secure file deletion                          │  │
│  │     • No external data transmission                 │  │
│  │     • Local-only operation                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  4. Rate Limiting                                   │  │
│  │     • Max 100 jobs/day                              │  │
│  │     • API request throttling                        │  │
│  │     • Concurrent job limits                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  5. Error Handling                                  │  │
│  │     • No sensitive data in errors                   │  │
│  │     • Secure logging                                │  │
│  │     • Graceful degradation                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Local Deployment (Single User)
```
┌─────────────────────────────────────────────────────┐
│              User's Machine                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Flutter Desktop App                           │ │
│  │  (Windows/macOS/Linux)                         │ │
│  │  Port: N/A (Native)                            │ │
│  └────────────┬───────────────────────────────────┘ │
│               │ HTTP (localhost)                    │
│  ┌────────────▼───────────────────────────────────┐ │
│  │  Node.js Backend                               │ │
│  │  Port: 3000                                    │ │
│  └────────────┬───────────────────────────────────┘ │
│               │                                      │
│  ┌────────────▼───────────────────────────────────┐ │
│  │  SQLite Database                               │ │
│  │  File: ./database/app.db                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  File System                                 │   │
│  │  /temp/uploads, /temp/results, /logs         │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
         ┌────────────────────────┐
         │  Anthropic Claude API  │
         │  (External Service)    │
         └────────────────────────┘
```

### Cloud Deployment (Optional)
```
┌─────────────────────────────────────────────────────┐
│              Client Devices                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   Web    │  │ Desktop  │  │  Mobile  │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
└───────┼─────────────┼─────────────┼─────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │ HTTPS
┌─────────────────────▼─────────────────────────────┐
│              Load Balancer (Optional)              │
└─────────────────────┬─────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────┐
│              Application Server                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Node.js Backend (PM2)                       │ │
│  │  Port: 3000                                  │ │
│  └──────────────┬───────────────────────────────┘ │
│                 │                                  │
│  ┌──────────────▼───────────────────────────────┐ │
│  │  SQLite Database (or PostgreSQL)             │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  File Storage (S3 / Local)                   │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
         ┌────────────────────────┐
         │  Anthropic Claude API  │
         └────────────────────────┘
```

---

## Scalability Considerations

### Current Design (Single User)
- **Concurrent Jobs:** 1-3
- **Daily Capacity:** 100 PDFs
- **Storage:** Local filesystem
- **Database:** SQLite

### Future Scaling Options
```
┌─────────────────────────────────────────────────────┐
│  Horizontal Scaling (Multi-User)                    │
│                                                      │
│  • Replace SQLite with PostgreSQL/MySQL             │
│  • Add Redis for job queue                          │
│  • Implement user authentication                    │
│  • Use S3/Cloud Storage for files                   │
│  • Add load balancing                               │
│  • Implement caching (Redis)                        │
│  • Add CDN for static assets                        │
│                                                      │
│  Capacity: 1000+ PDFs/day, 100+ concurrent users    │
└─────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

```
┌───────────────────────────────────────────────────────┐
│                  Logging Strategy                      │
│                                                        │
│  Application Logs (Winston)                           │
│  ├── info.log      - General application logs         │
│  ├── error.log     - Error logs                       │
│  ├── api-usage.log - Claude API usage                 │
│  └── debug.log     - Debug information (dev only)     │
│                                                        │
│  Database Logs                                         │
│  ├── Query performance                                │
│  └── Transaction logs                                 │
│                                                        │
│  Processing Logs (in database)                        │
│  └── processing_logs table                            │
│                                                        │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  Metrics Tracking                      │
│                                                        │
│  Performance Metrics                                   │
│  ├── Processing time per job                          │
│  ├── OCR extraction time                              │
│  ├── Classification time                              │
│  └── Export generation time                           │
│                                                        │
│  API Metrics                                           │
│  ├── Claude API calls                                 │
│  ├── Token usage                                      │
│  ├── Cost estimation                                  │
│  └── Error rates                                      │
│                                                        │
│  Quality Metrics                                       │
│  ├── Duplicate removal rate                           │
│  ├── Classification accuracy                          │
│  └── Success/failure rates                            │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────┐
│  Error Occurs   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Categorize Error           │
│  • Validation               │
│  • Processing               │
│  • API                      │
│  • System                   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Log Error                  │
│  • Winston logger           │
│  • Database (if job-related)│
│  • Include context          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Retry Logic (if applicable)│
│  • Max 3 attempts           │
│  • Exponential backoff      │
│  • Track retry count        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Update Job Status          │
│  • Mark as failed           │
│  • Store error message      │
│  • Update error_stage       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Notify User                │
│  • Return error response    │
│  • Show in UI               │
│  • Provide actionable info  │
└─────────────────────────────┘
```

---

This architecture document provides a comprehensive overview of the system design, component interactions, data flows, and deployment strategies for the Schematic OCR Extraction Tool.
