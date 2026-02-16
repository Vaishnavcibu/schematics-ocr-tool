# Schematic OCR Extraction Tool

> A powerful cross-platform application for extracting and intelligently classifying text from PDF schematics using Tesseract OCR and Claude Sonnet 4 AI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org)
[![Flutter](https://img.shields.io/badge/Flutter-3.16+-blue.svg)](https://flutter.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)

---

## 🎯 Overview

The Schematic OCR Extraction Tool is designed to streamline the process of extracting and organizing text from electronic schematic PDFs. It combines powerful OCR technology with AI-driven classification to automatically categorize extracted text under user-defined headings.

### Key Features

✨ **Intelligent Text Extraction**
- Tesseract OCR for accurate text recognition
- Multi-page PDF support (up to 20MB)
- Confidence scoring and bounding box extraction

🤖 **AI-Powered Classification**
- Claude Sonnet 4 integration for smart categorization
- User-defined heading classification
- Batch processing for efficiency
- Automatic retry with exponential backoff

🔍 **Advanced Filtering**
- Test point pattern filtering
- Component pattern filtering
- Wildcard and regex support
- Automatic duplicate removal (90%+ accuracy)

📊 **Multiple Export Formats**
- JSON with comprehensive metadata
- CSV for spreadsheet compatibility
- Excel (.xlsx) with formatting

🌐 **Cross-Platform Support**
- Web (Chrome, Firefox, Safari, Edge)
- Desktop (Windows, macOS, Linux)
- Mobile (iOS, Android)

📱 **Modern UI/UX**
- Dark theme with premium design
- Real-time processing updates
- Drag-and-drop file upload
- Responsive across all devices

---

## 📸 Screenshots

### Configuration Screen
Upload PDFs and configure classification headings and filters.

### Processing Screen
Real-time progress tracking with stage-by-stage updates.

### Results Screen
View classified results with expandable sections and export options.

### History Screen
Browse, search, and manage past processing jobs.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Flutter** 3.16 or higher
- **Anthropic Claude API Key** ([Get one here](https://console.anthropic.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/schematics-ocr-tool.git
   cd schematics-ocr-tool
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and add your CLAUDE_API_KEY
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   flutter pub get
   flutter run -d chrome  # For web
   # Or
   flutter run -d windows # For desktop
   ```

4. **Access the application**
   - Web: http://localhost:8080
   - Desktop: Native window will open
   - Mobile: Connect device and run `flutter run`

---

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Product Requirements Document (PRD)](docs/prd.md)** - Complete project requirements
- **[UI Design Specification](docs/ui-design-specification.md)** - Detailed UI/UX design
- **[Backend Schema Structures](docs/backend-schema-structures.md)** - Database and API schemas
- **[System Architecture](docs/system-architecture.md)** - Architecture diagrams and flows
- **[Implementation Plan](docs/implementation-plan.md)** - 10-week development roadmap
- **[Quick Reference Guide](docs/quick-reference.md)** - Commands, patterns, and troubleshooting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Frontend                      │
│              (Web, Desktop, Mobile)                      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼───────────────────────────────────┐
│                  Node.js Backend                         │
│  • Express.js API Server                                │
│  • Tesseract OCR Engine                                 │
│  • Job Queue System                                     │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   SQLite     │ │  Claude  │ │ File System  │
│   Database   │ │   API    │ │   Storage    │
└──────────────┘ └──────────┘ └──────────────┘
```

---

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **OCR:** Tesseract.js
- **AI:** Anthropic Claude SDK
- **Database:** SQLite3
- **Job Queue:** Bull (Redis-based)
- **Logging:** Winston

### Frontend
- **Framework:** Flutter 3.16+
- **Language:** Dart 3.2+
- **State Management:** Riverpod
- **HTTP Client:** Dio
- **Local Storage:** sqflite / IndexedDB
- **UI:** Material Design 3

---

## 📋 Usage

### 1. Upload PDF
- Drag and drop a PDF file (max 20MB)
- Or click to browse and select

### 2. Configure Classification
- Enter main headings (e.g., "Power Supply", "CPU Section")
- Add optional test point filters (e.g., "TP*", "TEST*")
- Add optional component filters (e.g., "R5001", "IC*")
- Toggle regex mode if needed

### 3. Process
- Click "Start Processing"
- Monitor real-time progress
- View stage-by-stage updates
- Cancel anytime if needed

### 4. Review Results
- View statistics (extracted, duplicates, classified)
- Browse classified items by heading
- Edit classifications manually if needed
- Export in JSON, CSV, or Excel format

### 5. Manage History
- View all past processing jobs
- Search and filter results
- Re-download previous exports
- Delete old jobs

---

## 🎨 UI Design

The application features a modern, premium dark theme with:

- **Color Palette:** Orange (#F2572B) primary with teal and purple accents
- **Typography:** Inter font family for clarity
- **Animations:** Smooth transitions and micro-interactions
- **Glassmorphism:** Modern card-based layouts
- **Responsive:** Adapts to all screen sizes

---

## 🔌 API Reference

### Upload PDF
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: PDF file
- mainHeadings: string[]
- testPointFilters: string[]
- componentFilters: string[]
- regexMode: boolean
```

### Check Status
```http
GET /api/status/:job_id

Response:
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 67,
    "current_stage": "classification"
  }
}
```

### Get Results
```http
GET /api/result/:job_id

Response:
{
  "success": true,
  "data": {
    "result": { /* Full JSON structure */ }
  }
}
```

See [Backend Schema Structures](docs/backend-schema-structures.md) for complete API documentation.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Tests
```bash
cd frontend

# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Widget tests
flutter test test/widget_test.dart
```

---

## 📦 Building for Production

### Web
```bash
cd frontend
flutter build web --release
# Output: build/web/
```

### Desktop

**Windows**
```bash
flutter build windows --release
# Output: build/windows/runner/Release/
```

**macOS**
```bash
flutter build macos --release
# Output: build/macos/Build/Products/Release/
```

**Linux**
```bash
flutter build linux --release
# Output: build/linux/x64/release/bundle/
```

### Mobile

**Android**
```bash
flutter build apk --release
# Or for app bundle:
flutter build appbundle --release
```

**iOS**
```bash
flutter build ios --release
# Then submit via Xcode
```

---

## 🔐 Security

- ✅ API keys stored in environment variables only
- ✅ No secrets in client code
- ✅ File type and size validation
- ✅ SQL injection prevention
- ✅ Database encryption at rest
- ✅ Secure file deletion after processing
- ✅ Rate limiting (100 jobs/day)
- ✅ Local-only operation (no cloud sync)

---

## 📊 Performance

### Targets
- **Processing Time:** <10 min for 20MB, 100-page PDF
- **Average Time:** <7 min
- **Success Rate:** >95%
- **Duplicate Removal:** >90% accuracy
- **Classification Accuracy:** >85%
- **Error Rate:** <5%

### Capacity
- **Daily Jobs:** 100 PDFs
- **Concurrent Jobs:** 1-3
- **File Size:** Up to 20MB
- **Pages:** No hard limit (tested up to 100 pages)

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core OCR extraction
- ✅ AI classification
- ✅ Multiple export formats
- ✅ Cross-platform support
- ✅ Job history management

### Version 2.0 (Planned)
- [ ] Batch processing (multiple PDFs)
- [ ] Cloud sync across devices
- [ ] Custom configuration templates
- [ ] Visual result editor
- [ ] RESTful API for integrations
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] Multi-language OCR support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/Dart style guides
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and well-described

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, versions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tesseract OCR** - Powerful open-source OCR engine
- **Anthropic Claude** - Advanced AI for text classification
- **Flutter Team** - Amazing cross-platform framework
- **Express.js** - Fast, minimalist web framework
- **SQLite** - Reliable embedded database

---

## 📞 Support

- **Documentation:** See `/docs` directory
- **Issues:** [GitHub Issues](https://github.com/yourusername/schematics-ocr-tool/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/schematics-ocr-tool/discussions)

---

## 📈 Project Status

**Current Version:** 1.0.0  
**Status:** In Development  
**Target Release:** April 27, 2026  
**Development Timeline:** 10 weeks

See [Implementation Plan](docs/implementation-plan.md) for detailed timeline.

---

<div align="center">

**Built with ❤️ using Node.js, Flutter, and Claude AI**

[Documentation](docs/) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>