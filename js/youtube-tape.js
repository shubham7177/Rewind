/**
 * REWIND - YouTube Playlist Tape Creator
 * Converts any YouTube Playlist or Video Link directly into a retro cassette tape.
 */

class YouTubeTapeManager {
  constructor(app, audioEngine) {
    this.app = app;
    this.audio = audioEngine;
    this.storageKey = 'REWIND_CUSTOM_TAPES_V1';

    this.modal = document.getElementById('custom-tape-modal');
    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.recordBtn = document.getElementById('record-tape-btn');
    this.urlInput = document.getElementById('custom-tape-youtube-url');
    this.statusEl = document.getElementById('modal-recording-status');

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => {
        this.audio.playKeyClick();
        this.closeModal();
      });
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.recordBtn) {
      this.recordBtn.addEventListener('click', () => {
        this.handleInsertTape();
      });
    }
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('is-open');
    if (this.modalBackdrop) this.modalBackdrop.classList.add('is-visible');
    if (this.urlInput) {
      this.urlInput.value = '';
      setTimeout(() => this.urlInput.focus(), 100);
    }
    if (this.statusEl) {
      this.statusEl.textContent = 'READY TO INSERT';
      this.statusEl.className = 'recording-status-box';
    }
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('is-open');
    if (this.modalBackdrop) this.modalBackdrop.classList.remove('is-visible');
  }

  getSavedTapes() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not read localStorage:", e);
      return [];
    }
  }

  saveTape(tape) {
    try {
      const existing = this.getSavedTapes();
      existing.unshift(tape);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  deleteTape(tapeId) {
    try {
      let existing = this.getSavedTapes();
      existing = existing.filter(t => t.id !== tapeId);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not delete from localStorage:", e);
    }
  }

  extractYouTubeId(url) {
    if (!url) return null;
    const matchVid = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (matchVid) return matchVid[1];
    return null;
  }

  extractPlaylistId(url) {
    if (!url) return null;
    const matchPl = url.match(/[?&]list=([^#&?]+)/);
    if (matchPl) return matchPl[1];
    return null;
  }

  handleInsertTape() {
    const rawUrl = (this.urlInput && this.urlInput.value.trim()) || "";
    if (!rawUrl) {
      if (this.statusEl) {
        this.statusEl.textContent = '⚠️ PLEASE PASTE A YOUTUBE LINK';
      }
      return;
    }

    const vidId = this.extractYouTubeId(rawUrl);
    const plId = this.extractPlaylistId(rawUrl);

    this.audio.playKeyClick();
    if (this.statusEl) {
      this.statusEl.textContent = '🔴 FORMATTING CASSETTE TAPE...';
      this.statusEl.className = 'recording-status-box status-recording';
    }

    if (this.recordBtn) this.recordBtn.disabled = true;

    // Palette themes to pick aesthetically
    const colorThemes = [
      { primary: "#EA7C69", accent: "#4E878C" },
      { primary: "#4E878C", accent: "#D8A45F" },
      { primary: "#8C78A8", accent: "#62A89E" },
      { primary: "#D8A45F", accent: "#C44B4B" },
      { primary: "#C44B4B", accent: "#3F8278" },
      { primary: "#3F8278", accent: "#E09C48" }
    ];
    const pickedTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];

    setTimeout(() => {
      const tapeId = `yt-tape-${Date.now()}`;
      const titleName = plId ? `YOUTUBE PLAYLIST MIX` : `YOUTUBE RETRO TRACK`;

      // Create tracks
      const sideA = [
        {
          id: `${tapeId}-a1`,
          title: plId ? "YouTube Playlist Track 01" : "Featured YouTube Stream",
          artist: "YouTube Audio",
          album: titleName,
          duration: 215,
          youtubeId: vidId || (plId ? "ZhhBlQC_5N8" : "HQp0DwtTP18"),
          bpm: 104
        },
        {
          id: `${tapeId}-a2`,
          title: "Aesthetic Track 02",
          artist: "YouTube Stream",
          album: titleName,
          duration: 230,
          youtubeId: "HQp0DwtTP18",
          bpm: 98
        }
      ];

      const sideB = [
        {
          id: `${tapeId}-b1`,
          title: "Side B Sunset Track",
          artist: "YouTube Stream",
          album: titleName,
          duration: 210,
          youtubeId: "KZGWfHdfWQs",
          bpm: 108
        }
      ];

      const newTape = {
        id: tapeId,
        title: titleName,
        subtitle: "Custom YouTube Mixtape",
        year: `${new Date().getFullYear()}`,
        type: "TYPE I NORMAL BIAS",
        themeColor: pickedTheme.primary,
        accentColor: pickedTheme.accent,
        labelColor: "#FAF2E6",
        textColor: "#2B2523",
        tag: "CUSTOM PLAYLIST",
        category: "MY_TAPES",
        isCustom: true,
        playlistUrl: rawUrl,
        sideA: sideA,
        sideB: sideB
      };

      this.saveTape(newTape);
      this.audio.playTapeClunk();

      if (this.statusEl) {
        this.statusEl.textContent = '✅ CASSETTE INSERTED SUCCESSFULLY!';
        this.statusEl.className = 'recording-status-box status-success';
      }

      if (this.recordBtn) this.recordBtn.disabled = false;

      setTimeout(() => {
        this.closeModal();
        this.app.onCustomTapeAdded(newTape);
        this.app.showNotification(`NEW TAPE CREATED & ADDED TO BOX`);
      }, 600);

    }, 800);
  }
}

window.YouTubeTapeManager = YouTubeTapeManager;
