# 🧶 CrochetGenius

A streamlined amigurumi project tracker with smart round-by-round instructions and automatic stitch counting.

## Features

- **Project Management**: Create and organize amigurumi projects
- **Component Tracking**: Break projects into body parts (head, arms, legs, etc.) with quantity support
- **Smart Round Entry**: Round-by-round instructions with abbreviation buttons
- **Automatic Stitch Counting**: Parser validates pattern math automatically
- **Crochet Mode**: Focused tracking view for active crocheting
- **Component Quantities**: Track "Arm 2 of 2" instead of duplicating components

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Create project structure:
```bash
npx create-react-app crochet-genius
cd crochet-genius
```

2. Copy the provided source files into the `src/` directory

3. Install (no additional dependencies needed - uses only React)

4. Start development server:
```bash
npm start
```

## Project Structure

```
src/
├── features/
│   ├── projects/           # Project management
│   │   ├── components/
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   └── ProjectCreationModal.jsx
│   │   ├── hooks/
│   │   │   └── projectsReducer.js
│   │   └── context/
│   │       └── ProjectsContext.js
│   │
│   ├── components/         # Component (body parts) management
│   │   ├── components/
│   │   │   ├── ComponentList.jsx
│   │   │   └── ComponentCreationModal.jsx
│   │
│   ├── rounds/            # Round entry & management
│   │   ├── components/
│   │   │   ├── RoundList.jsx
│   │   │   └── RoundEntryModal.jsx
│   │   └── utils/
│   │       └── (parser is in shared/utils)
│   │
│   └── crochet-mode/      # Working mode
│       └── components/
│           └── CrochetMode.jsx
│
├── shared/
│   ├── components/
│   │   ├── CrochetAbbreviationBar.jsx
│   │   ├── Modal.jsx
│   │   ├── Button.jsx
│   │   └── PageHeader.jsx
│   │
│   ├── hooks/
│   │   ├── useCrochetAbbreviations.js
│   │   └── useModal.js
│   │
│   ├── utils/
│   │   ├── storage.js                  # ✅ Created
│   │   ├── logger.js                   # ✅ Created
│   │   └── parseRoundInstruction.js    # ✅ Created
│   │
│   └── data/
│       └── crochetAbbreviations.js     # ✅ Created
│
├── styles/
│   ├── index.css          # ✅ Created
│   ├── colors.css         # ✅ Created
│   └── components.css     # To be created
│
├── App.js                 # ✅ Created
└── index.js               # ✅ Created
```

## Data Structure

### Project
```javascript
{
  id: 'uuid',
  name: 'Bunny Amigurumi',
  created: '2026-01-26T12:00:00Z',
  updated: '2026-01-26T14:30:00Z',
  components: [...]
}
```

### Component
```javascript
{
  id: 'uuid',
  name: 'Head',
  quantity: 1,           // How many to make
  completedCount: 0,     // How many completed
  rounds: [...]
}
```

### Round
```javascript
{
  id: 'uuid',
  roundNumber: 1,
  instruction: '6 sc in MR',
  stitchCount: 6
}
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Storage layer
- [x] Logger
- [x] Parse round instructions
- [x] Crochet abbreviations data
- [x] Color palette
- [x] Projects context
- [x] Projects reducer

### Phase 2: Core UI (In Progress)
- [ ] ProjectList component
- [ ] ProjectDetail component
- [ ] ComponentList component  
- [ ] RoundList component
- [ ] Modal components

### Phase 3: Smart Features
- [ ] CrochetAbbreviationBar
- [ ] useCrochetAbbreviations hook
- [ ] RoundEntryModal with smart buttons
- [ ] Crochet Mode

### Phase 4: Polish
- [ ] Component styles
- [ ] Responsive design
- [ ] Error boundaries
- [ ] Loading states

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State Management** | React Context + Reducer | Simple, no extra dependencies |
| **Storage** | localStorage with backup | Offline-first, reliable |
| **Stitch Counting** | Automatic parsing | Reduces user error, faster entry |
| **Component Quantities** | Built-in tracking | Cleaner than duplicates |
| **US vs UK Mode** | US only (v1) | 95% of amigurumi uses US terms |

## Color Palette

```css
/* Coral Primary */
--coral-500: #FF8B68

/* Mint Secondary */
--mint-500: #48BB78

/* Warm Neutrals */
--warm-100: #F5F5F4
--warm-600: #78716C
--warm-800: #44403C
```

## Parser Examples

The `parseRoundInstruction` function understands these patterns:

```javascript
'6 sc in MR'           → 6 stitches
'inc in each st'       → previousCount * 2
'(sc, inc) x 6'        → previousCount + 6
'(2 sc, inc) x 6'      → previousCount + 6
'24 sc'                → 24 stitches
'sc around'            → previousCount (no change)
```

## Contributing

This is the initial build. Focus areas:
1. Building out UI components
2. Testing the parser with edge cases
3. Polishing the crochet mode experience
4. Mobile optimization

## License

MIT License

## Acknowledgments

- Architecture inspired by IntelliKnit
- Built for the amigurumi community 🧸
