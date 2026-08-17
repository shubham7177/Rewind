# 📼 REWIND — Nostalgic Cassette Music Experience

<div align="center">

```
  ____  _______        _____ _   _ ____  
 |  _ \| ____\ \      / /_ _| \ | |  _ \ 
 | |_) |  _|  \ \ /\ / / | ||  \| | | | |
 |  _ <| |___  \ V  V /  | || |\  | |_| |
 |_| \_\_____|  \_/\_/  |___|_| \_|____/ 
```

**Step back into the golden analog era.**  
*An illustrated 1980s/1990s retro cassette music player built with tactile mechanical controls, rotating tape spools, dynamic VU meters, and curated YouTube playlists.*

---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript%20%2F%20HTML5%20%2F%20CSS3-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-EA7C69.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![YouTube API](https://img.shields.io/badge/YouTube-IFrame%20API-FF0000.svg)](https://developers.google.com/youtube/iframe_api_reference)

</div>

---

## ✨ Features

- 🎛️ **Master Vintage Cassette Deck**:
  - **Rotating Gear Reels**: 6-spoke gear spools with dynamic tape roll progression (left spool roll decreases while right spool roll thickens as tracks progress).
  - **Dual-Channel LED VU Meter**: 10-segment dynamic stereo LED bars (Green, Amber, Red) that pulse in real-time to the rhythm of the music.
  - **Mechanical 4-Digit Roller Counter**: Analog tape counter with working tactile `RESET` ratchet.
  - **3D Tactile Piano Keys**: `REW`, `PREV`, `PLAY` (with coral illumination), `PAUSE`, `NEXT`, and `F.FWD` with physical click and motor whirr sound effects.
  - **Rotary Cream Knobs**: Live rotatable dials for `VOLUME`, `BALANCE`, `BASS` (-12dB to +12dB), and `TREBLE` (-12dB to +12dB).
  - **Dolby Noise Reduction**: Interactive toggle switch with illuminated indicator LED.

- 🎵 **Curated & Custom Playlists**:
  - **Default Starting Tape**: *"LYRICS HITS & AESTHETIC VIBES"* loaded with 12 popular hits across Side A and Side B (*Sahiba*, *Saiyaara*, *Sailor Song*, *Sapphire*, *Agar Tum Saath Ho*, and more).
  - **YouTube Playlist Streaming**: Seamlessly streams real audio from YouTube with instant autoplay on track transitions.
  - **Add Custom YouTube Playlists**: Single-step insertion modal—paste any YouTube playlist or video URL to automatically format and record a custom retro cassette.
  - **Delete Cassettes**: Remove any tape from your cassette box anytime.

- 🎨 **Aesthetic Vintage UI**:
  - **Floating Library Tab**: Pinned to the middle-right screen edge for quick browsing.
  - **3D Cassette Card Flip**: Rotate cassettes 180° to inspect and play Side B tracklists.
  - **Cassette Flight Animation**: Visual take-off animation gliding selected tapes across the screen directly into the deck door.
  - **Live Time & Listeners Badge**: Real-time clock with pulsating green broadcast dot and dynamic listener count.
  - **Framed Nostalgic Anime Artwork**: Handcrafted golden hour illustrations with film grain textures.
  - **Zero Scrollbar Desktop Viewport**: Calibrated to fit `100vh` on desktop displays without vertical scrollbars.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>→</kbd> / <kbd>Right Arrow</kbd> | Next Track |
| <kbd>←</kbd> / <kbd>Left Arrow</kbd> | Previous Track |
| <kbd>R</kbd> | Rewind 10 seconds |
| <kbd>F</kbd> | Fast Forward 10 seconds |
| <kbd>L</kbd> | Toggle Cassette Library Box |

---

## 🚀 Quick Start (Local Setup)

REWIND is a **zero-dependency, pure Vanilla web application** (HTML5, CSS3, and ES6 JavaScript). No Node build or compilation is required.

### 1. Clone the repository
```bash
git clone https://github.com/shubham7177/Rewind.git
cd Rewind
```

### 2. Start a local server
Using Python (built-in on most systems):
```bash
python -m http.server 8085
```

Or using Node (`npx serve`):
```bash
npx serve . -p 8085
```

### 3. Open in Browser
Navigate to **`http://localhost:8085`** in your browser.

---

## 📂 Project Structure

```
Rewind/
├── index.html                   # Master single-page application structure
├── package.json                 # Project metadata & npm scripts
├── .gitignore                   # Git ignore file
├── README.md                    # Project documentation
│
├── css/
│   ├── main.css                 # Design tokens, color palettes, layout, and header
│   ├── cassette-deck.css        # Vintage cassette player hardware, reels & piano keys
│   ├── visual-panels.css        # Framed anime artwork panels & captions
│   ├── library-drawer.css       # Floating right-edge tab, drawer & 3D cassette flip cards
│   ├── modal.css                # YouTube playlist import dialog
│   └── responsive.css           # Mobile & tablet responsive adaptations
│
├── js/
│   ├── app.js                   # Master coordinator & live clock/listener updates
│   ├── audio-engine.js          # YouTube Iframe API player & mechanical audio SFX
│   ├── player-deck.js           # Deck hardware, piano keys, reels, VU meters & dials
│   ├── library.js               # Cassette drawer, 3D flip cards, flight animation & deletion
│   ├── youtube-tape.js          # Custom YouTube playlist tape manager
│   └── data/
│       ├── global-tapes.js      # Default starter playlist & retro cassette collections
│       └── india-tapes.js       # Curated nostalgic Indian retro classics
│
└── assets/
    └── images/
        ├── sunset-beach.jpg     # Sunset beach camper illustration
        ├── girl-headphones.jpg  # Anime girl with retro pink headphones
        ├── india-monsoon.jpg    # Monsoon veranda & vintage radio
        └── india-marine-drive.jpg # Ambassador cruising Marine Drive twilight
```

---

## 🌐 Deployment

Because REWIND is built with static web standards, it can be deployed with one click to:
- **GitHub Pages**: Go to Repo Settings → Pages → Select `main` branch → Save.
- **Vercel**: Run `vercel` or connect your GitHub repository.
- **Netlify**: Drag and drop the root folder or connect your GitHub repository.
- **Cloudflare Pages**: Connect repo and set build output directory to `./`.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for analog music lovers everywhere.</sub>
</div>
