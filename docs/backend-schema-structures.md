# Backend Schema Structures (MongoDB)
## Schematic OCR Extraction Tool

---

## Database Collections (MongoDB)

### 1. Jobs Collection
Stores processing job information and metadata.

```javascript
{
  "_id": ObjectId,
  "jobId": String,        // UUID v4 for external reference
  "filename": String,
  "fileSize": Number,
  "fileHash": String,
  
  // Configuration
  "config": {
    "mainHeadings": [String],
    "testPointFilters": [String],
    "componentFilters": [String],
    "regexMode": Boolean
  },
  
  // Status & Progress
  "status": {
    "state": String,      // 'pending', 'processing', 'completed', 'failed', 'cancelled'
    "stage": String,      // 'upload', 'ocr', 'dedup', 'filter', 'classify', 'export'
    "progress": Number,    // 0-100
    "errorMessage": String,
    "errorStage": String,
    "retryCount": Number
  },
  
  // Timestamps
  "timestamps": {
    "createdAt": Date,
    "startedAt": Date,
    "completedAt": Date,
    "processingTimeSeconds": Number
  },
  
  // Statistics
  "stats": {
    "totalExtracted": Number,
    "duplicatesRemoved": Number,
    "filteredCount": Number,
    "classifiedCount": Number,
    "unclassifiedCount": Number,
    "pagesProcessed": Number
  },
  
  // File Paths
  "paths": {
    "pdfPath": String,
    "resultJsonPath": String
  },
  
  "metadata": {
    "userAgent": String,
    "deletedAt": Date
  }
}
```

### 2. ExtractedItems Collection
Stores raw text extracted from PDFs.

```javascript
{
  "_id": ObjectId,
  "jobId": String,        // Reference to Jobs.jobId
  "text": String,
  "pageNumber": Number,
  "flags": {
    "isDuplicate": Boolean,
    "isFiltered": Boolean,
    "filterReason": String // 'test_point', 'component'
  },
  "ocr": {
    "confidence": Number,
    "boundingBox": {
      "x": Number,
      "y": Number,
      "w": Number,
      "h": Number
    }
  },
  "createdAt": Date
}
```

### 3. ClassifiedResults Collection
Stores final AI-classified data.

```javascript
{
  "_id": ObjectId,
  "jobId": String,
  "extractedItemId": ObjectId, // Reference to ExtractedItems
  "text": String,
  "pageNumber": Number,
  "heading": String,
  "classification": {
    "score": Number,
    "level": String,      // 'high', 'medium', 'low'
    "model": String,      // 'claude-3-5-sonnet'
    "tokensUsed": Number,
    "timestamp": Date
  },
  "edits": {
    "isEdited": Boolean,
    "originalHeading": String,
    "editedAt": Date
  }
}
```

### 4. Logs Collection
Job-specific processing logs.

```javascript
{
  "_id": ObjectId,
  "jobId": String,
  "level": String,        // 'info', 'warn', 'error'
  "stage": String,
  "message": String,
  "details": Mixed,
  "timestamp": Date
}
```

### 5. Settings Collection
Global application settings.

```javascript
{
  "_id": ObjectId,
  "key": { type: String, unique: true },
  "value": Mixed,
  "type": String,         // 'string', 'number', 'boolean', 'json'
  "description": String,
  "updatedAt": Date
}
```

---

## Indexing Strategy
- `Jobs`: Index on `jobId` (unique), `status.state`, `timestamps.createdAt`
- `ExtractedItems`: Index on `jobId`, `flags.isDuplicate`, `flags.isFiltered`
- `ClassifiedResults`: Index on `jobId`, `heading`
- `Logs`: Index on `jobId`, `timestamp`

---

## API & Validation Rules
- All requests use `application/json` (except file uploads)
- MongoDB ObjectIds are used internally, UUIDs for API interaction
- Standard Joi validation for configuration inputs
- Strict 20MB file size limit enforced via Multer
