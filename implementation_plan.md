# Implementation Plan: REWIND - Nostalgic Cassette Music Experience

Build a complete, production-quality, responsive web application concept for **“REWIND”** — an illustrated 1980s/1990s cassette music player brought into a modern web interface, following the exact visual foundation and all 35 specifications from the reference design.

---

## User Review Required

> [!IMPORTANT]
> - **Visual Fidelity**: We will replicate the exact illustrated aesthetic from the reference image: soft pastel peach background (`#F7B8A5`), warm cream hardware panels (`#FAF2E6`), dusty coral (`#EA7C69`) & teal (`#4E878C`) accents, dark ink hand-drawn outlines, and subtle paper grain textures.
> - **Core Animation & Physicality**: Interactive mechanical piano-key buttons, rotating tape spools with tape-spool thickness progression, animated VU meter bars, rotatable hardware knobs (Volume, Balance, Bass, Treble), Dolby noise reduction switch, and the signature **Cassette Flight Animation** (Select -> Lift -> Fly -> Slide into Deck -> Snap & Play).
> - **Audio Engine**: Built-in Web Audio API synthesizer + curated retro lofi / 80s synth / Indian retro melodies + authentic mechanical sound effects (button clicks, cassette insert clunk, tape hiss filter toggleable with Noise Reduction).
> - **Library & Custom YouTube Tapes**: Closed on initial load; slides out with physical spring physics; allows flipping between Side A & Side B; lets users add custom YouTube playlist tapes saved to `localStorage`.

---

## Proposed Architecture & File Structure

```
d:/Rewind/
├── index.html                  # Semantic HTML5 single-page structure with 16:9 responsive desktop & mobile layouts
├── css/
│   ├── main.css                # Color variables, typography tokens, paper grain background, layout grid
│   ├── cassette-deck.css       # Left hero cassette player, reels, VU meter, piano keys, knobs, headphone cord
│   ├── visual-panels.css       # Center framed anime/nostalgic sunset ocean illustrations & song info
│   ├── library-drawer.css      # Right sliding cassette storage box, vertical carousel, focus effects
│   ├── modal.css               # "Insert Your Tape" YouTube playlist modal & retro notifications
│   └── responsive.css          # Mobile drawer bottom-sheet, touch controls & adaptive layouts
├── js/
│   ├── app.js                  # Main coordinator, state management, initialization
│   ├── audio-engine.js         # Web Audio API engine, BiquadFilters for Bass/Treble, Panner, Tape Hiss, SFX
│   ├── player-deck.js          # Hardware controls, piano keys, counter ticker, rotating reels, VU meter canvas
│   ├── library.js              # Cassette carousel physics, focus state, cassette flight animation
│   ├── youtube-tape.js         # YouTube playlist parser, tape creation, localStorage persistence
│   └── data/
│       ├── global-tapes.js     # Global collections (Golden 80s, The 70s Classics, 90s Mix Tape, etc.)
│       └── india-tapes.js      # India mode collections (Purani Yaaden, Golden Bollywood, Retro Romance, etc.)
└── assets/
    ├── images/                 # High-res illustrated nostalgic panels (Panel 1: Sunset Beach, Panel 2: Ocean Girl)
    └── sfx/                    # Mechanical click, tape clunk, tape motor SFX
```

---

## Key Features & Components

### 1. Header & Navigation
- Top-left: Hand-lettered logo `[📼] REWIND` with `GOOD MUSIC. GOOD TIMES.`
- Top-center: Physical segmented switch `[ 🌐 GLOBAL | 🏛️ INDIA ]` with ink outline & smooth sliding indicator.
- Top-right: Floating `< LIBRARY` paper/metal tab button.

### 2. Left Hero: The Master Vintage Cassette Deck
- **Cassette Compartment**: Detailed illustrated cassette with `[A] GOLDEN 80s` label, transparent tape window, dual 6-spoke reels with smooth rotation & tape progression, Type I indicator, Noise Reduction toggle switch.
- **Floral Accent Band**: Black enamel panel with peach/coral cherry blossoms matching reference image.
- **Mechanical Tape Counter**: 4-digit roller (`0247`) incrementing in sync with playback + working `RESET` button + Dolby System logo.
- **Dynamic VU Meter**: Dual-channel green/amber/red LED segment meter driven by real Web Audio analyzer.
- **Mechanical Piano Keys**: `REW`, `PREV`, `PLAY` (coral lit), `PAUSE`, `NEXT`, `F.FWD` with 3D tactile press depth.
- **Tactile Knobs & Headphone Cord**: Interactive rotatable Volume, Balance, Bass, Treble knobs + realistic curving headphone cable from `PHONES` jack.

### 3. Center Visual Storytelling & Playback Info
- **Framed Artwork Panels**: Two tall nostalgic panels (Panel 1: Sunset ocean beach with traveler; Panel 2: Girl with pink headphones facing the sea). Transitions dynamically on India mode toggle.
- **Song Metadata**: Minimal hand-lettered track title, artist, and Side A/B tag.
- **Analog Progress Bar**: Hand-drawn slider track with elapsed & total time.
- **Secondary Controls & Utility Row**: Shuffle, Repeat, Speed (0.75x, 1.0x, 1.25x, 1.5x), Equalizer modal, Tape Hiss FX.

### 4. Right Library Drawer & Cassette Carousel
- **Initial Load State**: Clean, spacious right side with only `< LIBRARY` floating tab visible.
- **Drawer Slide-in**: Physical wooden/cream cassette box slides in with bounce (500–700ms).
- **Vertical Cassette Carousel**: Smooth scroll/drag with spring physics; center cassette elevates with glowing ink shadow; displays song count, duration, and animated `NOW PLAYING` bars.
- **Cassette Flight Animation**: Clicking a tape triggers a flight path across the screen into the deck slot with mechanical snap SFX.
- **Side A / Side B Flipping**: 3D card rotation revealing alternate tracklists.
- **Add YouTube Tape Modal**: Retro insertion slot UI for custom YouTube links with "READING TAPE..." simulation, saving to `MY TAPES` in `localStorage`.

### 5. Mobile & Responsive Layout
- Cassette deck remains hero element; artwork transitions cleanly; library turns into a bottom-sheet drawer with touch-friendly gestures.

---

## Verification Plan

### Automated / Browser Verification
1. Open local preview via HTTP server and verify desktop 16:9 layout.
2. Verify visual fidelity against reference image (colors, ink outlines, floral strip, VU meter, knobs, typography).
3. Test all interactions:
   - Click `< LIBRARY` -> Drawer opens with bounce.
   - Select another cassette -> Flight animation moves cassette into deck, updates label, starts reel rotation.
   - Click Piano keys (`PLAY`, `PAUSE`, `REW`, `F.FWD`, `RESET`) -> Check mechanical state & audio.
   - Switch `GLOBAL` ↔ `INDIA` -> Check cassette collection & artwork transition.
   - Toggle `SIDE A` / `SIDE B` -> Check 3D flip animation and tracklist update.
   - Add YouTube tape -> Check modal, simulated read, and persistence in `MY TAPES`.
   - Test responsive layout on mobile viewport (375px/414px) and tablet (768px).

---

Please click **Proceed** or approve the plan to start execution!
