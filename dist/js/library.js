/**
 * REWIND - Cassette Library Drawer & Flight Animation Controller
 * Handles sliding cassette storage box, vertical carousel, 3D Side A/B flipping,
 * tape deletion, and the signature Cassette Flight path into the player deck.
 */

class CassetteLibrary {
  constructor(app, audioEngine) {
    this.app = app;
    this.audio = audioEngine;

    this.drawerEl = document.getElementById('library-drawer');
    this.drawerBackdrop = document.getElementById('library-backdrop');
    this.toggleTab = document.getElementById('library-toggle-tab');
    this.closeBtn = document.getElementById('library-close-btn');
    this.carouselEl = document.getElementById('cassette-carousel');
    this.addTapeBtn = document.getElementById('add-tape-open-btn');
    this.tapeCountBadge = document.getElementById('library-tape-count');
    this.floatingBadge = document.getElementById('library-tab-badge');

    this.isOpen = false;
    this.flippedTapes = new Set(); // IDs of currently flipped tapes (Side B)

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.toggleTab) {
      this.toggleTab.addEventListener('click', () => {
        this.audio.playKeyClick();
        this.toggle();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.audio.playKeyClick();
        this.close();
      });
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => {
        this.close();
      });
    }

    // Add Tape Button
    if (this.addTapeBtn) {
      this.addTapeBtn.addEventListener('click', () => {
        this.audio.playKeyClick();
        this.app.openCustomTapeModal();
      });
    }
  }

  toggle(forceState) {
    const newState = forceState !== undefined ? forceState : !this.isOpen;
    if (newState) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.isOpen = true;
    this.drawerEl.classList.add('is-open');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.add('is-visible');
    if (this.toggleTab) this.toggleTab.classList.add('is-hidden');
    this.renderTapes();
  }

  close() {
    this.isOpen = false;
    this.drawerEl.classList.remove('is-open');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('is-visible');
    if (this.toggleTab) this.toggleTab.classList.remove('is-hidden');
  }

  renderTapes() {
    if (!this.carouselEl) return;
    const allTapes = this.app.getAllActiveTapes();

    // Update count badges
    if (this.tapeCountBadge) {
      this.tapeCountBadge.textContent = `${allTapes.length} TAPES`;
    }
    if (this.floatingBadge) {
      this.floatingBadge.textContent = `${allTapes.length}`;
    }

    this.carouselEl.innerHTML = '';

    if (allTapes.length === 0) {
      this.carouselEl.innerHTML = `
        <div class="empty-library-state">
          <div class="empty-icon">📼</div>
          <h3>YOUR CASSETTE BOX IS EMPTY</h3>
          <p>Click <strong>"+ ADD YOUTUBE PLAYLIST"</strong> above to insert a tape!</p>
        </div>
      `;
      return;
    }

    allTapes.forEach(tape => {
      const isCurrentTape = this.app.currentTape && this.app.currentTape.id === tape.id;
      const isFlipped = this.flippedTapes.has(tape.id);
      const activeSide = isFlipped ? 'B' : 'A';

      const card = document.createElement('div');
      card.className = `library-tape-card ${isCurrentTape ? 'is-playing-card' : ''} ${isFlipped ? 'is-flipped' : ''}`;
      card.id = `library-tape-${tape.id}`;
      card.style.setProperty('--card-primary', tape.themeColor || '#EA7C69');
      card.style.setProperty('--card-accent', tape.accentColor || '#4E878C');
      card.style.setProperty('--card-label', tape.labelColor || '#FAF2E6');

      card.innerHTML = `
        <div class="tape-3d-wrapper">
          <!-- FRONT: SIDE A -->
          <div class="tape-face tape-face-front">
            <div class="tape-spine-bar">
              <span class="spine-badge">${tape.year || '2025'}</span>
              <span class="spine-title">${tape.title}</span>
              <button class="tape-delete-btn" data-tape-id="${tape.id}" title="Delete Tape from Library">🗑️ DELETE</button>
            </div>
            
            <div class="tape-face-body">
              <div class="tape-label-card">
                <div class="tape-label-header">
                  <span class="tape-side-tag">SIDE A</span>
                  <span class="tape-genre-tag">${tape.tag || 'PLAYLIST'}</span>
                </div>
                <div class="tape-label-title">${tape.title}</div>
                <div class="tape-label-subtitle">${tape.subtitle}</div>
                <div class="tape-label-window">
                  <div class="mini-reel"></div>
                  <div class="mini-tape-center"></div>
                  <div class="mini-reel"></div>
                </div>
              </div>

              <!-- Tracklist Preview -->
              <div class="tape-tracklist-preview">
                ${tape.sideA.map((t, idx) => `
                  <div class="track-row ${isCurrentTape && this.app.currentTrackIndex === idx && !isFlipped ? 'is-active-track' : ''}" data-side="A" data-index="${idx}">
                    <span class="trk-num">A${idx + 1}</span>
                    <span class="trk-name">${t.title}</span>
                    <span class="trk-dur">${this.formatDuration(t.duration)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="tape-card-actions">
                <button class="tape-action-btn flip-btn" data-tape-id="${tape.id}">
                  <span>🔄 FLIP TO SIDE B</span>
                </button>
                <button class="tape-action-btn insert-btn" data-tape-id="${tape.id}" data-side="A">
                  <span>${isCurrentTape && !isFlipped ? '▶ PLAYING' : '📼 INSERT & PLAY'}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- BACK: SIDE B -->
          <div class="tape-face tape-face-back">
            <div class="tape-spine-bar">
              <span class="spine-badge">${tape.year || '2025'}</span>
              <span class="spine-title">${tape.title}</span>
              <button class="tape-delete-btn" data-tape-id="${tape.id}" title="Delete Tape from Library">🗑️ DELETE</button>
            </div>
            
            <div class="tape-face-body">
              <div class="tape-label-card">
                <div class="tape-label-header">
                  <span class="tape-side-tag">SIDE B</span>
                  <span class="tape-genre-tag">${tape.tag || 'PLAYLIST'}</span>
                </div>
                <div class="tape-label-title">${tape.title}</div>
                <div class="tape-label-subtitle">${tape.subtitle}</div>
                <div class="tape-label-window">
                  <div class="mini-reel"></div>
                  <div class="mini-tape-center"></div>
                  <div class="mini-reel"></div>
                </div>
              </div>

              <!-- Side B Tracklist -->
              <div class="tape-tracklist-preview">
                ${tape.sideB.map((t, idx) => `
                  <div class="track-row ${isCurrentTape && this.app.currentTrackIndex === idx && isFlipped ? 'is-active-track' : ''}" data-side="B" data-index="${idx}">
                    <span class="trk-num">B${idx + 1}</span>
                    <span class="trk-name">${t.title}</span>
                    <span class="trk-dur">${this.formatDuration(t.duration)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="tape-card-actions">
                <button class="tape-action-btn flip-btn" data-tape-id="${tape.id}">
                  <span>🔄 FLIP TO SIDE A</span>
                </button>
                <button class="tape-action-btn insert-btn" data-tape-id="${tape.id}" data-side="B">
                  <span>${isCurrentTape && isFlipped ? '▶ PLAYING' : '📼 INSERT & PLAY'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Bind Delete Action
      card.querySelectorAll('.tape-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playKeyClick();
          this.app.deleteTape(tape.id);
        });
      });

      // Bind Flip Action
      card.querySelectorAll('.flip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playTapeFlip();
          if (this.flippedTapes.has(tape.id)) {
            this.flippedTapes.delete(tape.id);
            card.classList.remove('is-flipped');
          } else {
            this.flippedTapes.add(tape.id);
            card.classList.add('is-flipped');
          }
        });
      });

      // Bind Insert / Play Action
      card.querySelectorAll('.insert-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const side = btn.getAttribute('data-side') || 'A';
          this.triggerCassetteFlight(card, tape, side, 0);
        });
      });

      // Bind Individual Track Click
      card.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const side = row.getAttribute('data-side');
          const index = parseInt(row.getAttribute('data-index'), 10);
          this.triggerCassetteFlight(card, tape, side, index);
        });
      });

      this.carouselEl.appendChild(card);
    });
  }

  triggerCassetteFlight(sourceCard, tape, side, trackIndex = 0) {
    const deckTarget = document.getElementById('deck-tape-body') || document.getElementById('cassette-deck');
    if (!sourceCard || !deckTarget) {
      this.app.loadAndPlayTape(tape, side, trackIndex);
      this.close();
      return;
    }

    const srcRect = sourceCard.getBoundingClientRect();
    const destRect = deckTarget.getBoundingClientRect();

    this.audio.playTapeEject();

    const flyer = document.createElement('div');
    flyer.className = 'cassette-flying-ghost';
    flyer.style.cssText = `
      position: fixed;
      top: ${srcRect.top}px;
      left: ${srcRect.left}px;
      width: ${srcRect.width}px;
      height: ${srcRect.height}px;
      background: ${tape.themeColor || '#EA7C69'};
      border: 2.5px solid #2B2523;
      border-radius: 12px;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
      transition: all 0.65s cubic-bezier(0.25, 1, 0.5, 1);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 12px;
      color: #FAF2E6;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
    `;

    flyer.innerHTML = `
      <div style="font-size: 14px; letter-spacing: 1px; color: #FAF2E6; text-align: center;">
        📼 ${tape.title} (SIDE ${side})
      </div>
      <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">INSERTING INTO DECK...</div>
    `;

    document.body.appendChild(flyer);

    deckTarget.classList.add('deck-door-open');

    requestAnimationFrame(() => {
      flyer.style.top = `${destRect.top + 8}px`;
      flyer.style.left = `${destRect.left + 8}px`;
      flyer.style.width = `${destRect.width - 16}px`;
      flyer.style.height = `${destRect.height - 16}px`;
      flyer.style.transform = 'rotate(-1deg) scale(0.96)';
      flyer.style.opacity = '0.9';
    });

    setTimeout(() => {
      this.audio.playTapeClunk();
      deckTarget.classList.remove('deck-door-open');
      deckTarget.classList.add('deck-snap-pulse');
      setTimeout(() => deckTarget.classList.remove('deck-snap-pulse'), 300);

      if (flyer.parentNode) {
        flyer.parentNode.removeChild(flyer);
      }

      this.app.loadAndPlayTape(tape, side, trackIndex);
      this.renderTapes();

      if (window.innerWidth <= 1024) {
        this.close();
      }
    }, 660);
  }

  formatDuration(sec) {
    if (!sec || isNaN(sec)) return '3:30';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

window.CassetteLibrary = CassetteLibrary;
