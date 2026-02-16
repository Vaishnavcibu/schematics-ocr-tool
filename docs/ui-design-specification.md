# UI Design Specification
## Schematic OCR Extraction Tool

### Design System

#### Color Palette
```css
/* Primary Colors */
--primary-orange: #F2572B
--primary-orange-light: #FF7A52
--primary-orange-dark: #D63E15

/* Secondary Colors */
--secondary-teal: #00BFA5
--secondary-purple: #7C4DFF
--secondary-blue: #2196F3

/* Neutral Colors */
--background-dark: #0F1419
--surface-dark: #1A1F29
--surface-light: #252D3A
--text-primary: #FFFFFF
--text-secondary: #B0B8C1
--text-tertiary: #6B7280

/* Status Colors */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Gradients */
--gradient-primary: linear-gradient(135deg, #F2572B 0%, #FF7A52 100%)
--gradient-success: linear-gradient(135deg, #10B981 0%, #34D399 100%)
--gradient-surface: linear-gradient(135deg, #1A1F29 0%, #252D3A 100%)
```

#### Typography
```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace

/* Font Sizes */
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 30px
--text-4xl: 36px

/* Font Weights */
--weight-regular: 400
--weight-medium: 500
--weight-semibold: 600
--weight-bold: 700
```

#### Spacing & Layout
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px

--border-radius-sm: 8px
--border-radius-md: 12px
--border-radius-lg: 16px
--border-radius-xl: 24px

--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2)
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3)
```

---

## Screen Designs

### 1. Configuration Screen (Main Entry Point)

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Schematic OCR Tool          [History] [Settings]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📄 Drag & Drop PDF Here                          │ │
│  │     or click to browse                             │ │
│  │                                                     │ │
│  │  Max 20MB • Supports multi-page PDFs              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Configuration                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Main Headings *                                    │ │
│  │ ┌────────────────────────────────────────────────┐ │ │
│  │ │ Power Supply                                   │ │ │
│  │ │ CPU Section                                    │ │ │
│  │ │ Memory Module                                  │ │ │
│  │ │ I/O Interfaces                                 │ │ │
│  │ └────────────────────────────────────────────────┘ │ │
│  │ Enter headings (comma or line-separated)          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────┐ ┌──────────────────────┐  │
│  │ Test Point Filters       │ │ Component Filters    │  │
│  │ ┌──────────────────────┐ │ │ ┌──────────────────┐ │  │
│  │ │ TP*                  │ │ │ │ R5001            │ │  │
│  │ │ TEST*                │ │ │ │ IC*              │ │  │
│  │ │ GND*                 │ │ │ │ U*               │ │  │
│  │ └──────────────────────┘ │ │ └──────────────────┘ │  │
│  │ [🔍] Regex Mode: OFF     │ │ [🔍] Regex Mode: OFF │  │
│  └──────────────────────────┘ └──────────────────────┘  │
│                                                          │
│                    [Start Processing →]                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Component Details

**File Upload Area**
- Height: 200px
- Border: 2px dashed --primary-orange with 50% opacity
- Background: --surface-dark with glassmorphism effect
- Hover: Border becomes solid, background lightens
- Active (dragging): Border color intensifies, scale 1.02
- Icon: Large PDF icon (48px) in --primary-orange
- Typography: 
  - Main text: --text-lg, --weight-medium
  - Subtitle: --text-sm, --text-secondary

**Main Headings Input**
- Multi-line textarea
- Min height: 120px, auto-expand
- Background: --surface-light
- Border: 1px solid transparent, focus: --primary-orange
- Placeholder: "Enter classification headings..."
- Character counter: Bottom right, --text-xs, --text-tertiary

**Filter Inputs**
- Two-column grid (50% each on desktop, stack on mobile)
- Each filter box:
  - Height: 100px
  - Background: --surface-light
  - Regex toggle: Switch component with icon
  - Helper text below: "Use * for wildcards"

**Start Button**
- Full width on mobile, auto width on desktop
- Height: 56px
- Background: --gradient-primary
- Text: --text-lg, --weight-semibold, white
- Hover: Scale 1.02, shadow-lg
- Disabled state: Grayscale, 50% opacity
- Loading state: Spinner inside button

---

### 2. Processing Screen

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Config                    [Cancel Processing]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│                     Processing PDF                       │
│                   schematic_v2.pdf                       │
│                                                          │
│                  ┌──────────────────┐                    │
│                  │                  │                    │
│                  │       67%        │                    │
│                  │                  │                    │
│                  └──────────────────┘                    │
│                                                          │
│              Classifying with AI...                      │
│              ~3 minutes remaining                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✓ PDF Upload Complete          0:05                │ │
│  │ ✓ OCR Extraction               2:34                │ │
│  │ ✓ Duplicate Removal            0:12                │ │
│  │ ⟳ AI Classification            3:15 (in progress)  │ │
│  │ ○ Export Generation            --                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Statistics So Far:                                      │
│  • 15,420 items extracted                               │
│  • 8,200 duplicates removed                             │
│  • 2,450 items classified (34%)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Component Details

**Progress Circle**
- Size: 200px diameter
- Stroke width: 12px
- Stroke: --gradient-primary with animated gradient rotation
- Background circle: --surface-light
- Percentage text: --text-4xl, --weight-bold, center aligned
- Animation: Smooth progress transition (0.3s ease)

**Stage Indicators**
- List of 5 stages
- Each stage:
  - Icon: Checkmark (✓), Spinner (⟳), or Circle (○)
  - Text: --text-base, --weight-medium
  - Time: --text-sm, --text-secondary, right-aligned
  - Completed: --success color
  - In Progress: --primary-orange color with pulse animation
  - Pending: --text-tertiary color

**Statistics Panel**
- Background: --surface-light
- Border-radius: --border-radius-md
- Padding: --spacing-lg
- Real-time updates with fade-in animation

**Cancel Button**
- Outline style
- Border: 2px solid --error
- Color: --error
- Hover: Background --error with 10% opacity
- Confirmation dialog on click

---

### 3. Results Screen

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  ← Process Another                      [Download JSON] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Processing Complete! ✓                                  │
│  schematic_v2.pdf • Processed in 6m 34s                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 15,420   │  │  8,200   │  │  7,220   │              │
│  │ Extracted│  │ Removed  │  │Classified│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  Classified Data:                                        │
│                                                          │
│  ▼ Power Supply (234 items)                             │
│  ┌────────────────────────────────────────────────────┐ │
│  │ VCC 3.3V Rail              Page 5    [High]        │ │
│  │ GND Reference Point        Page 5    [High]        │ │
│  │ +12V Input                 Page 7    [Medium]      │ │
│  │ ...                                                 │ │
│  │ [Show all 234 items →]                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ▶ CPU Section (412 items)                              │
│                                                          │
│  ▶ Memory Module (189 items)                            │
│                                                          │
│  ▶ Unclassified (134 items)                             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [📥 Download JSON] [📊 Export CSV] [📑 Export Excel]│ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Component Details

**Statistics Cards**
- Three-column grid (stack on mobile)
- Each card:
  - Background: --gradient-surface
  - Border-radius: --border-radius-lg
  - Padding: --spacing-lg
  - Number: --text-3xl, --weight-bold, --primary-orange
  - Label: --text-sm, --text-secondary
  - Icon: Top-left corner, 24px
  - Hover: Lift effect (translateY -4px, shadow-lg)

**Accordion Sections**
- Expandable/collapsible
- Header:
  - Background: --surface-light
  - Height: 64px
  - Chevron icon (animated rotation)
  - Item count badge: --primary-orange background
- Content:
  - Max height: 400px with scroll
  - Each item:
    - Background: --surface-dark
    - Border-left: 3px solid --primary-orange
    - Padding: --spacing-md
    - Hover: Background lightens
  - Confidence badge:
    - High: --success
    - Medium: --warning
    - Low: --text-tertiary
  - Page number: --text-xs, --text-secondary

**Action Buttons**
- Three buttons in a row (stack on mobile)
- Primary (Download JSON):
  - Background: --gradient-primary
  - Icon: Download icon
- Secondary (CSV, Excel):
  - Background: transparent
  - Border: 2px solid --primary-orange
  - Color: --primary-orange
  - Hover: Background --primary-orange with 10% opacity

---

### 4. History Screen

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Processing History                    [🗑️ Delete All]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔍 Search files...                    [Filter ▼]   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ □ schematic_v2.pdf                     [Success]   │ │
│  │   Feb 16, 2026 • 7,220 items classified            │ │
│  │   [👁️ View] [📥 Download] [🗑️ Delete]              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ □ power_board_rev3.pdf                 [Success]   │ │
│  │   Feb 15, 2026 • 4,892 items classified            │ │
│  │   [👁️ View] [📥 Download] [🗑️ Delete]              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ □ mainboard_schematic.pdf              [Failed]    │ │
│  │   Feb 14, 2026 • Error: No text detected           │ │
│  │   [🔄 Retry] [🗑️ Delete]                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [← Previous]  Page 1 of 5  [Next →]                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Component Details

**Search Bar**
- Full width
- Height: 48px
- Background: --surface-light
- Border-radius: --border-radius-md
- Icon: Search icon (20px) left side
- Filter dropdown: Right side
  - Options: All, Success, Failed, Last 7 days, Last 30 days

**History Cards**
- Each card:
  - Background: --surface-dark
  - Border-radius: --border-radius-md
  - Padding: --spacing-lg
  - Hover: Border 1px solid --primary-orange, shadow-md
  - Checkbox: Left side for bulk selection
  - Status badge: Top right
    - Success: --success background
    - Failed: --error background
  - Filename: --text-lg, --weight-semibold
  - Metadata: --text-sm, --text-secondary
  - Action buttons: Icon + text, --text-sm

**Empty State**
- Centered content
- Illustration: 200px height
- Text: --text-xl, --text-secondary
- CTA button: "Process Your First PDF"

**Pagination**
- Bottom center
- Page numbers with ellipsis
- Previous/Next buttons
- Current page: --primary-orange background

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Single column layout
  - Stack filter inputs
  - Full-width buttons
  - Reduced spacing
  - Smaller typography
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - Two-column grid for filters
  - Moderate spacing
  - Standard typography
}

/* Desktop */
@media (min-width: 1025px) {
  - Multi-column layouts
  - Maximum width: 1200px
  - Generous spacing
  - Larger interactive elements
}
```

---

## Animations & Micro-interactions

### Button Interactions
```css
.button {
  transition: all 0.2s ease;
}
.button:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}
.button:active {
  transform: scale(0.98);
}
```

### Card Hover Effects
```css
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Progress Animations
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Page Transitions
- Fade in: 0.3s ease
- Slide up: 0.4s cubic-bezier
- Stagger children: 0.1s delay between elements

---

## Accessibility Features

- **Keyboard Navigation**: Full tab order, focus indicators
- **Screen Readers**: ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Focus States**: 2px solid --primary-orange outline
- **Error Messages**: Clear, actionable, associated with inputs
- **Loading States**: Announced to screen readers
- **Touch Targets**: Minimum 44x44px on mobile

---

## Dark Mode (Default)

All designs above use dark mode as the primary theme. Light mode can be added later with:
- Inverted background/text colors
- Adjusted shadow opacity
- Maintained brand colors (orange, teal, etc.)
