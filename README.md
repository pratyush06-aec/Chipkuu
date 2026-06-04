# 📋 Clipboard Workspace

A **local-first** browser-based productivity tool for managing copied items — links, text snippets, images, and audio references — in a visual drag-and-drop workspace. Paired with a Chrome extension for quick capture.

> **This is a personal productivity tool.** No cloud, no accounts, no backend. Everything stays on your machine.

![Clipboard Workspace Screenshot](docs/screenshots/workspace-main.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Dev Server](#running-the-dev-server)
  - [Building for Production](#building-for-production)
- [Chrome Extension Setup](#chrome-extension-setup)
- [Architecture](#architecture)
  - [Card Model](#card-model)
  - [Storage Strategy](#storage-strategy)
  - [Drag & Drop](#drag--drop)
  - [Component Hierarchy](#component-hierarchy)
- [File Reference](#file-reference)
- [Development Guide](#development-guide)
  - [Adding a New Card Type](#adding-a-new-card-type)
  - [Modifying Columns](#modifying-columns)
  - [Styling & Theming](#styling--theming)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **5-Column Board** | Inbox, Links, Images, Text, Audio — each color-coded with card counts |
| **4 Card Types** | Link (🔗), Text (📝), Image (🖼️), Audio (🎵) — each with distinct rendering |
| **Drag & Drop** | Move cards between any columns using @dnd-kit |
| **Local Persistence** | Cards auto-save to `localStorage` — survives page refresh |
| **Search** | Real-time search bar filtering across all columns by content and title |
| **Type Filters** | Filter the entire board by card type (All, Links, Text, Images, Audio) |
| **Delete** | Permanently remove cards with a hover-reveal 🗑 button |
| **Copy to Clipboard** | Copy card content back to system clipboard with a 📋 button |
| **Toast Notifications** | Visual feedback for delete and copy actions |
| **Chrome Extension** | Manifest V3 popup to save the current page URL or selected text |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.x |
| **Bundler** | Vite | 8.x |
| **Language** | JavaScript (ES Modules) | — |
| **Styling** | Tailwind CSS | 4.x |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable | 6.x / 10.x |
| **Persistence** | localStorage / chrome.storage.local | — |
| **Extension** | Chrome Extension Manifest V3 | — |
| **Font** | Inter (Google Fonts) | — |

---

## Project Structure

```
Chipkuu/
├── README.md                          # This file
└── clipboard-workspace/              # Main application
    ├── index.html                     # HTML shell with Inter font
    ├── vite.config.js                # Vite + Tailwind plugin config
    ├── package.json                  # Dependencies and scripts
    ├── public/
    │   └── favicon.svg               # App favicon
    ├── src/
    │   ├── main.jsx                  # React entry point
    │   ├── App.jsx                   # Root component: state, persistence, toasts
    │   ├── index.css                 # Tailwind v4 + custom dark theme tokens
    │   ├── components/
    │   │   ├── Board.jsx             # DnD context, search bar, filters, 5-column layout
    │   │   ├── Column.jsx            # Droppable column with header and card list
    │   │   └── Card.jsx              # Universal card with 4 type renderers + actions
    │   ├── data/
    │   │   └── dummyData.js          # 10 sample cards for first launch
    │   └── utils/
    │       └── storage.js            # Storage wrapper (localStorage ↔ chrome.storage)
    └── extension/
        ├── manifest.json             # Chrome Extension Manifest V3
        ├── background.js             # Service worker (minimal)
        ├── popup.html                # Extension popup UI
        ├── popup.js                  # Popup logic: save link, save text
        ├── popup.css                 # Popup dark theme styling
        └── icons/
            ├── icon-16.png           # Toolbar icon
            ├── icon-48.png           # Extensions page icon
            └── icon-128.png          # Web Store / install dialog icon
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (comes with Node.js)
- **Google Chrome** (for extension testing)
- **Git** — [Download](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/pratyush06-aec/Chipkuu.git
cd Chipkuu/clipboard-workspace

# Install dependencies
npm install
```

### Running the Dev Server

```bash
npm run dev
```

Opens at **http://localhost:5173/**. The workspace loads with 10 sample cards on first launch. These are persisted to `localStorage` — subsequent launches will load your saved state.

### Building for Production

```bash
npm run build
```

Output goes to `clipboard-workspace/dist/`. You can preview the production build with:

```bash
npm run preview
```

---

## Universal Extension Setup

The extension is compatible with **Chrome, Edge, Brave, Opera, Firefox, and Safari (macOS)**.

### Option A: Loading from Source (Developers)

**For Chromium browsers (Chrome, Edge, Brave):**
1. Open **`chrome://extensions`** (or `edge://extensions`)
2. Toggle **Developer mode**
3. Click **Load unpacked** and select the `Chipkuu/clipboard-workspace/extension/` folder.

**For Firefox:**
1. Open **`about:debugging#/runtime/this-firefox`**
2. Click **Load Temporary Add-on**
3. Select any file inside the `Chipkuu/clipboard-workspace/extension/` folder (like `manifest.json`).

### Option B: Installing from a .zip (End Users)

If someone has shared a `.zip` file with you (e.g., `clipboard-workspace-v1.2.0.zip`):
1. Extract the `.zip` file to a folder on your computer.
2. Follow the steps in **Option A** to load that extracted folder into your browser.

### Option C: Safari on macOS

Safari requires the web extension to be wrapped in a native macOS app. Apple provides a command-line tool to do this automatically.

1. Ensure you have **Xcode** installed from the Mac App Store.
2. Open Terminal and run the converter on the `extension` directory:
   ```bash
   xcrun safari-web-extension-converter path/to/Chipkuu/clipboard-workspace/extension
   ```
3. This will generate an Xcode project and automatically open it.
4. Click the **Run** button (`Cmd + R`) in Xcode to build the app.
5. Once the app launches, it will ask you to open **Safari Settings**.
6. Go to the **Extensions** tab in Safari and check the box next to **Clipboard Workspace**.

### Using the Extension

- **Save Current Page**: Click the extension icon → click "Save Current Page" to save the current tab's URL as a link card in the Inbox.
- **Save Selected Text**: Select text on any page → click the extension icon → click "Save Selected Text" to save the selection as a text card.

### Extension Permissions

| Permission | Purpose |
|-----------|---------|
| `activeTab` | Access the current tab's URL and title |
| `storage` | Persist cards in `chrome.storage.local` |

---

## Architecture

### Card Model

Every item in the workspace is a **card** with this shape:

```javascript
{
  id: "card-1719100000000-a1b2c3",   // Unique ID (timestamp + random)
  type: "link",                       // "link" | "text" | "image" | "audio"
  content: "https://github.com",     // The actual content
  title: "GitHub",                   // Display title
  section: "inbox",                  // Current column: "inbox" | "links" | "images" | "text" | "audio"
  createdAt: 1719100000000           // Unix timestamp (ms)
}
```

### Card Type Rendering

| Type | Rendering |
|------|-----------|
| `link` | Title + clickable URL in blue |
| `text` | Title + content preview (3-line clamp) |
| `image` | Thumbnail with error fallback |
| `audio` | Play button + randomized waveform visualization |

### Storage Strategy

The app uses a **storage wrapper** (`src/utils/storage.js`) that provides a unified async API:

```
┌─────────────────────┐
│   App / Extension    │
│                      │
│  loadItems()         │
│  saveItems(cards)    │
└──────────┬───────────┘
           │
     ┌─────▼──────┐
     │  Wrapper    │
     │ (auto-      │
     │  detects)   │
     └─────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
localStorage   chrome.storage.local
 (dev mode)     (extension mode)
```

- **Dev mode** (`npm run dev`): Uses `localStorage`. Data is scoped to `http://localhost:5173`.
- **Extension mode**: Uses `chrome.storage.local`. Data is scoped to the extension.

> **Note**: These are currently **separate** storage spaces. Cards saved via the extension popup won't appear in the dev server workspace, and vice versa. Bridging them requires serving the React app as an extension page (future enhancement).

### Drag & Drop

Powered by [@dnd-kit](https://dndkit.com/):

```
Board (DndContext)
  ├── Column "inbox" (useDroppable)
  │     ├── Card (useSortable)
  │     └── Card (useSortable)
  ├── Column "links" (useDroppable)
  │     └── Card (useSortable)
  └── ... (images, text, audio)
```

- **DndContext** wraps the entire board, handles collision detection with `closestCorners`
- **Columns** are droppable zones via `useDroppable`
- **Cards** are draggable + sortable via `useSortable`
- **DragOverlay** renders a ghost copy of the dragged card
- On drop, the card's `section` field is updated and the state is persisted

### Component Hierarchy

```
App
 ├── Board
 │    ├── Header (search bar + filters)
 │    └── DndContext
 │         ├── Column (inbox)
 │         │    ├── Card
 │         │    └── Card
 │         ├── Column (links)
 │         │    └── Card
 │         ├── Column (images)
 │         ├── Column (text)
 │         └── Column (audio)
 └── Toast (overlay)
```

---

## File Reference

### `src/App.jsx`
Root component. Manages the cards state array, loads from storage on mount, auto-persists on every change, and provides `handleDelete` / `handleCopy` callbacks with toast notifications.

### `src/components/Board.jsx`
The main workspace layout. Contains:
- The `DndContext` provider with `PointerSensor`
- Search bar with real-time filtering
- Type filter buttons (All, Links, Text, Images, Audio)
- The 5-column horizontal layout
- `DragOverlay` for the ghost card during drag

### `src/components/Column.jsx`
A single column. Contains:
- Color-coded header with icon and card count badge
- `useDroppable` hook for accepting dropped cards
- `SortableContext` for ordering cards within the column
- Empty-state placeholder when no cards present

### `src/components/Card.jsx`
The universal card component. Contains:
- `useSortable` hook for drag behavior
- Type-based content renderer (switch on `card.type`)
- Hover-reveal action buttons (copy, delete)
- Glassmorphism styling with type-specific gradient borders

### `src/data/dummyData.js`
10 sample cards used on first launch. Covers all 4 types and all 5 sections.

### `src/utils/storage.js`
Storage abstraction layer. Exports:
- `loadItems()` → `Promise<Card[] | null>`
- `saveItems(cards)` → `Promise<void>`
- `generateId()` → `string`

### `src/index.css`
Tailwind CSS v4 entry point with custom theme tokens:
- Dark color palette (`--color-bg-*`, `--color-text-*`)
- Column accent colors (`--color-col-inbox`, etc.)
- Custom scrollbar, card entrance animation, drag overlay styles

---

## Development Guide

### Adding a New Card Type

1. **Define the type config** in `src/components/Card.jsx`:

```javascript
// Add to the typeConfig object
video: {
  icon: "🎬",
  label: "Video",
  gradient: "from-cyan-500/10 to-cyan-600/5",
  border: "border-cyan-500/20",
  badge: "bg-cyan-500/15 text-cyan-400",
},
```

2. **Add a renderer** in the `CardContent` switch statement:

```javascript
case "video":
  return (
    <div className="space-y-1.5">
      {/* Your video card rendering */}
    </div>
  );
```

3. **Add a filter option** in `src/components/Board.jsx`:

```javascript
{ key: "video", label: "Videos", icon: "🎬" },
```

4. **Add a column** (if desired) — update the `SECTIONS` array in `Board.jsx` and add a `columnConfig` entry in `Column.jsx`.

### Modifying Columns

Columns are defined in two places:

- `SECTIONS` array in `Board.jsx` — controls which columns render and their order
- `columnConfig` object in `Column.jsx` — controls each column's label, icon, color, and empty text

To add a new column:

```javascript
// Board.jsx
const SECTIONS = ["inbox", "links", "images", "text", "audio", "notes"];

// Column.jsx — add to columnConfig
notes: {
  label: "Notes",
  icon: "🗒️",
  color: "var(--color-accent-cyan)",
  emptyText: "Drag notes here",
},
```

### Styling & Theming

All theme tokens are in `src/index.css` under the `@theme` directive:

```css
@theme {
  --color-bg-primary: #0a0a0f;     /* Main background */
  --color-bg-card: #1a1a27;        /* Card background */
  --color-accent-purple: #8b5cf6;  /* Primary accent */
  /* ... */
}
```

To switch to a light theme, override these tokens. The entire UI references them via `var(--color-*)`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| `npm run build` | Create production build in `dist/` |
| `npm run build:extension` | Build and copy the workspace directly into the extension folder |
| `npm run package` | Generate a universal `.zip` file of the extension for distribution |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the codebase |

---

## Roadmap

### ✅ MVP (v1.0) — Current
- [x] 5-column visual workspace
- [x] 4 card types (link, text, image, audio)
- [x] Drag-and-drop between columns
- [x] Local persistence (localStorage)
- [x] Chrome extension (save URL + text)
- [x] Search and type filters
- [x] Delete and copy-to-clipboard

### 🔜 Next Up
- [ ] Auto-capture on copy (content script intercepts Ctrl+C)
- [ ] Right-click context menu for images
- [ ] Badge notification on extension icon
- [ ] On/off toggle for auto-capture

### 🔮 Future Versions
- [ ] Supabase backend + cloud sync (v2)
- [ ] Authentication (v2)
- [ ] Mobile application (v3)
- [ ] AI-powered search (v4)
- [ ] Relationship mapping between cards (v5)

---

## License

This project is for personal use. No license specified.

---

<p align="center">
  Built with ❤️ as a local-first productivity tool
</p>
