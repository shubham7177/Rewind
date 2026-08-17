/**
 * REWIND - Main Application Coordinator
 * Connects Audio Engine, Hero Cassette Deck, Artwork Panels,
 * Floating Library Drawer, and Live Clock / Listeners Tracker.
 */

class RewindApp {
  constructor() {
    this.currentTape = null;
    this.currentSide = 'A';
    this.currentTrackIndex = 0;
    this.isShuffle = false;
    this.repeatMode = 'ALL';
    this.playbackSpeed = 1.0;

    this.deletedTapeIds = new Set();

    // Sub-controllers
    this.audio = new window.RetroAudioEngine();
    this.deck = null;
    this.library = null;
    this.tapeManager = null;

    // Live Indicators
    this.clockEl = document.getElementById('live-clock');
    this.listenerCountEl = document.getElementById('live-listener-count');
    this.baseListenerCount = 500 + Math.floor(Math.random() * 30);

    // Notifications
    this.notificationEl = document.getElementById('retro-notification');
    this.notificationTimeout = null;

    this.init();
  }

  init() {
    // Initialize sub-controllers
    this.deck = new window.PlayerDeckController(this.audio, this);
    this.library = new window.CassetteLibrary(this, this.audio);
    this.tapeManager = new window.YouTubeTapeManager(this, this.audio);

    this.bindGlobalAudioCallbacks();
    this.bindKeyboardShortcuts();
    this.startLiveIndicators();

    // Load initial tape (Starting YouTube Playlist)
    const initialTapes = this.getAllActiveTapes();
    if (initialTapes.length > 0) {
      this.loadTape(initialTapes[0], 'A', 0, false);
    }
  }

  startLiveIndicators() {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // '0' should be '12'
      if (this.clockEl) {
        this.clockEl.textContent = `${hours}:${minutes} ${ampm}`;
      }
    };

    updateClock();
    setInterval(updateClock, 1000);

    // Gentle realistic listener count fluctuations
    const updateListeners = () => {
      const delta = (Math.random() > 0.48 ? 1 : -1) * Math.floor(Math.random() * 4 + 1);
      this.baseListenerCount = Math.max(450, Math.min(620, this.baseListenerCount + delta));
      if (this.listenerCountEl) {
        this.listenerCountEl.textContent = `${this.baseListenerCount} listening`;
      }
    };

    if (this.listenerCountEl) {
      this.listenerCountEl.textContent = `${this.baseListenerCount} listening`;
    }
    setInterval(updateListeners, 9000);
  }

  getAllActiveTapes() {
    const baseList = window.GLOBAL_TAPES || [];
    const indiaList = window.INDIA_TAPES || [];
    const customTapes = this.tapeManager ? this.tapeManager.getSavedTapes() : [];
    const combined = [...baseList, ...indiaList, ...customTapes];
    return combined.filter(t => !this.deletedTapeIds.has(t.id));
  }

  deleteTape(tapeId) {
    this.deletedTapeIds.add(tapeId);
    if (this.tapeManager) {
      this.tapeManager.deleteTape(tapeId);
    }

    // If the deleted tape is currently playing/loaded in deck
    if (this.currentTape && this.currentTape.id === tapeId) {
      this.audio.stop();
      const remaining = this.getAllActiveTapes();
      if (remaining.length > 0) {
        this.loadTape(remaining[0], 'A', 0, false);
      } else {
        this.currentTape = null;
        if (this.deck) {
          if (this.deck.tapeTitle) this.deck.tapeTitle.textContent = "NO TAPE LOADED";
          if (this.deck.tapeArtist) this.deck.tapeArtist.textContent = "Insert a tape from Library";
          this.deck.updatePlaybackState(false);
        }
      }
    }

    if (this.library) {
      this.library.renderTapes();
    }

    this.showNotification("CASSETTE REMOVED FROM BOX");
  }

  bindGlobalAudioCallbacks() {
    this.audio.onTimeUpdate = (currentTime, duration) => {
      if (this.deck) {
        this.deck.updateTapeSpoolProgression(currentTime, duration);
      }
    };

    this.audio.onTrackEnd = () => {
      this.handleTrackEnd();
    };
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.prevTrack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextTrack();
          break;
        case 'KeyR':
          this.audio.playMotorWhirr(true);
          this.seekRelative(-10);
          break;
        case 'KeyF':
          this.audio.playMotorWhirr(false);
          this.seekRelative(10);
          break;
        case 'KeyL':
          if (this.library) this.library.toggle();
          break;
      }
    });
  }

  loadTape(tape, side = 'A', trackIndex = 0, autoPlay = false) {
    if (!tape) return;
    this.currentTape = tape;
    this.currentSide = side;
    this.currentTrackIndex = trackIndex;

    const trackList = side === 'A' ? tape.sideA : tape.sideB;
    const currentTrack = trackList[trackIndex] || trackList[0];

    this.audio.loadTrack(currentTrack, tape, side, autoPlay);

    // Update Hero Deck UI
    if (this.deck) {
      this.deck.updateTapeDeckUI(tape, currentTrack, side);
      this.deck.updatePlaybackState(autoPlay || this.audio.isPlaying);
    }

    if (autoPlay) {
      this.playTrack();
    }
  }

  loadAndPlayTape(tape, side = 'A', trackIndex = 0) {
    this.loadTape(tape, side, trackIndex, true);
  }

  playTrack() {
    if (!this.currentTape) return;
    this.audio.play();
    if (this.deck) this.deck.updatePlaybackState(true);
    if (this.library) this.library.renderTapes();
  }

  pauseTrack() {
    this.audio.pause();
    if (this.deck) this.deck.updatePlaybackState(false);
    if (this.library) this.library.renderTapes();
  }

  togglePlay() {
    this.audio.playKeyClick();
    if (this.audio.isPlaying) {
      this.pauseTrack();
    } else {
      this.playTrack();
    }
  }

  nextTrack() {
    if (!this.currentTape) return;
    const trackList = this.currentSide === 'A' ? this.currentTape.sideA : this.currentTape.sideB;

    let nextIdx = this.currentTrackIndex + 1;
    if (this.isShuffle) {
      nextIdx = Math.floor(Math.random() * trackList.length);
    } else if (nextIdx >= trackList.length) {
      if (this.currentSide === 'A' && this.currentTape.sideB && this.currentTape.sideB.length > 0) {
        this.showNotification('FLIPPING TO SIDE B...');
        this.currentSide = 'B';
        nextIdx = 0;
      } else {
        nextIdx = 0;
      }
    }

    this.currentTrackIndex = nextIdx;
    const nextTrack = (this.currentSide === 'A' ? this.currentTape.sideA : this.currentTape.sideB)[nextIdx];
    this.audio.loadTrack(nextTrack, this.currentTape, this.currentSide, true);
    if (this.deck) {
      this.deck.updateTapeDeckUI(this.currentTape, nextTrack, this.currentSide);
      this.deck.updatePlaybackState(true);
    }
    this.playTrack();
  }

  prevTrack() {
    if (!this.currentTape) return;
    const trackList = this.currentSide === 'A' ? this.currentTape.sideA : this.currentTape.sideB;

    if (this.audio.currentTime > 3) {
      this.audio.seek(0);
      return;
    }

    let prevIdx = this.currentTrackIndex - 1;
    if (prevIdx < 0) {
      if (this.currentSide === 'B') {
        this.currentSide = 'A';
        prevIdx = this.currentTape.sideA.length - 1;
      } else {
        prevIdx = trackList.length - 1;
      }
    }

    this.currentTrackIndex = prevIdx;
    const prevTrack = (this.currentSide === 'A' ? this.currentTape.sideA : this.currentTape.sideB)[prevIdx];
    this.audio.loadTrack(prevTrack, this.currentTape, this.currentSide, true);
    if (this.deck) {
      this.deck.updateTapeDeckUI(this.currentTape, prevTrack, this.currentSide);
      this.deck.updatePlaybackState(true);
    }
    this.playTrack();
  }

  seekRelative(deltaSeconds) {
    if (!this.audio) return;
    const newTime = Math.max(0, Math.min(this.audio.duration, this.audio.currentTime + deltaSeconds));
    this.audio.seek(newTime);
  }

  handleTrackEnd() {
    if (this.repeatMode === 'ONE') {
      this.audio.seek(0);
      this.audio.play();
    } else if (this.repeatMode === 'ALL') {
      this.nextTrack();
    } else {
      const trackList = this.currentSide === 'A' ? this.currentTape.sideA : this.currentTape.sideB;
      if (this.currentTrackIndex < trackList.length - 1) {
        this.nextTrack();
      } else {
        this.pauseTrack();
      }
    }
  }

  toggleLibrary(forceOpen) {
    if (this.library) {
      this.library.toggle(forceOpen);
    }
  }

  openCustomTapeModal() {
    if (this.tapeManager) {
      this.tapeManager.openModal();
    }
  }

  onCustomTapeAdded(newTape) {
    if (this.library) {
      this.library.renderTapes();
    }
  }

  showNotification(message) {
    if (!this.notificationEl) return;
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationEl.textContent = message;
    this.notificationEl.classList.add('is-visible');

    this.notificationTimeout = setTimeout(() => {
      this.notificationEl.classList.remove('is-visible');
    }, 2400);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.rewindApp = new RewindApp();
});
