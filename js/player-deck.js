/**
 * REWIND - Master Cassette Deck Controller
 * Handles reels, tape progression, piano keys, mechanical counter,
 * VU meter, rotary knobs, and deck animations.
 */

class PlayerDeckController {
  constructor(audioEngine, app) {
    this.audio = audioEngine;
    this.app = app;

    // Elements
    this.deckElement = document.getElementById('cassette-deck');
    this.tapeBody = document.getElementById('deck-tape-body');
    this.tapeTitle = document.getElementById('deck-tape-title');
    this.tapeArtist = document.getElementById('deck-tape-artist');
    this.tapeSideBadge = document.getElementById('deck-tape-side');
    this.tapeTypeBadge = document.getElementById('deck-tape-type');

    this.leftReel = document.getElementById('left-spool-gear');
    this.rightReel = document.getElementById('right-spool-gear');
    this.leftTapeSpool = document.getElementById('left-tape-pack');
    this.rightTapeSpool = document.getElementById('right-tape-pack');

    this.counterDigits = [
      document.getElementById('counter-d1'),
      document.getElementById('counter-d2'),
      document.getElementById('counter-d3'),
      document.getElementById('counter-d4')
    ];
    this.counterResetBtn = document.getElementById('counter-reset-btn');
    this.counterBaseValue = 0;

    this.dolbySwitch = document.getElementById('dolby-toggle-switch');
    this.dolbyLed = document.getElementById('dolby-led');

    this.vuLedsLeft = Array.from(document.querySelectorAll('#vu-meter-left .vu-segment'));
    this.vuLedsRight = Array.from(document.querySelectorAll('#vu-meter-right .vu-segment'));

    // Piano Keys
    this.keys = {
      rew: document.getElementById('key-rew'),
      prev: document.getElementById('key-prev'),
      play: document.getElementById('key-play'),
      pause: document.getElementById('key-pause'),
      next: document.getElementById('key-next'),
      ffwd: document.getElementById('key-ffwd'),
      eject: document.getElementById('key-eject')
    };

    // Knobs
    this.knobs = {
      volume: { el: document.getElementById('knob-volume'), val: 0.85, min: 0, max: 1, type: 'vol' },
      balance: { el: document.getElementById('knob-balance'), val: 0, min: -1, max: 1, type: 'bal' },
      bass: { el: document.getElementById('knob-bass'), val: 2, min: -12, max: 12, type: 'eq' },
      treble: { el: document.getElementById('knob-treble'), val: 3, min: -12, max: 12, type: 'eq' }
    };

    this.vuAnimationId = null;
    this.init();
  }

  init() {
    this.bindPianoKeys();
    this.bindKnobs();
    this.bindCounter();
    this.bindDolby();
    this.startVUMeterLoop();
  }

  bindPianoKeys() {
    // Play
    this.keys.play.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.pressKey('play');
      this.app.playTrack();
    });

    // Pause
    this.keys.pause.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.pressKey('pause');
      this.app.pauseTrack();
    });

    // Prev
    this.keys.prev.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.audio.playMotorWhirr(true);
      this.pressKey('play');
      this.app.prevTrack();
    });

    // Next
    this.keys.next.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.audio.playMotorWhirr(false);
      this.pressKey('play');
      this.app.nextTrack();
    });

    // Rewind (Rewind 10s)
    this.keys.rew.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.audio.playMotorWhirr(true);
      this.pressKeyTemporary('rew');
      this.fastSpinReels(-1);
      this.app.seekRelative(-10);
    });

    // Fast Forward (Forward 10s)
    this.keys.ffwd.addEventListener('click', () => {
      this.audio.playKeyClick();
      this.audio.playMotorWhirr(false);
      this.pressKeyTemporary('ffwd');
      this.fastSpinReels(1);
      this.app.seekRelative(10);
    });

    // Eject
    if (this.keys.eject) {
      this.keys.eject.addEventListener('click', () => {
        this.audio.playTapeEject();
        this.pressKeyTemporary('eject');
        this.app.toggleLibrary(true);
      });
    }
  }

  pressKey(name) {
    Object.keys(this.keys).forEach(k => {
      if (this.keys[k]) {
        this.keys[k].classList.remove('is-pressed', 'is-active');
      }
    });

    if (name === 'play' && this.keys.play) {
      this.keys.play.classList.add('is-pressed', 'is-active');
    } else if (name === 'pause' && this.keys.pause) {
      this.keys.pause.classList.add('is-pressed');
    }
  }

  pressKeyTemporary(name) {
    const key = this.keys[name];
    if (!key) return;
    key.classList.add('is-pressed');
    setTimeout(() => {
      key.classList.remove('is-pressed');
      if (this.audio.isPlaying && this.keys.play) {
        this.keys.play.classList.add('is-pressed', 'is-active');
      }
    }, 250);
  }

  fastSpinReels(direction) {
    if (!this.leftReel || !this.rightReel) return;
    this.leftReel.classList.add(direction < 0 ? 'spin-fast-reverse' : 'spin-fast-forward');
    this.rightReel.classList.add(direction < 0 ? 'spin-fast-reverse' : 'spin-fast-forward');
    setTimeout(() => {
      this.leftReel.classList.remove('spin-fast-reverse', 'spin-fast-forward');
      this.rightReel.classList.remove('spin-fast-reverse', 'spin-fast-forward');
    }, 450);
  }

  bindCounter() {
    if (this.counterResetBtn) {
      this.counterResetBtn.addEventListener('click', () => {
        this.audio.playCounterReset();
        this.counterResetBtn.classList.add('is-pressed');
        setTimeout(() => this.counterResetBtn.classList.remove('is-pressed'), 150);
        this.counterBaseValue = 0;
        this.updateCounter(0);
      });
    }
  }

  updateCounter(seconds) {
    const totalCount = Math.floor(this.counterBaseValue + seconds * 1.25) % 10000;
    const str = totalCount.toString().padStart(4, '0');
    for (let i = 0; i < 4; i++) {
      if (this.counterDigits[i]) {
        this.counterDigits[i].textContent = str[i];
      }
    }
  }

  bindDolby() {
    if (this.dolbySwitch) {
      this.dolbySwitch.addEventListener('click', () => {
        this.audio.playKeyClick();
        const newState = !this.audio.isDolbyEnabled;
        this.audio.setDolbyNR(newState);
        this.dolbySwitch.classList.toggle('switch-on', newState);
        if (this.dolbyLed) {
          this.dolbyLed.classList.toggle('led-lit', newState);
        }
        this.app.showNotification(`DOLBY NOISE REDUCTION: ${newState ? 'ON' : 'OFF'}`);
      });
    }
  }

  bindKnobs() {
    Object.keys(this.knobs).forEach(key => {
      const knobObj = this.knobs[key];
      if (!knobObj.el) return;

      this.updateKnobVisual(key, knobObj.val);

      let startY = 0;
      let startVal = knobObj.val;
      let isDragging = false;

      const onPointerDown = (e) => {
        isDragging = true;
        startY = e.clientY || (e.touches && e.touches[0].clientY);
        startVal = knobObj.val;
        document.body.style.cursor = 'ns-resize';
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const deltaY = startY - clientY;
        const range = knobObj.max - knobObj.min;
        const sensitivity = 150;
        const newVal = Math.max(knobObj.min, Math.min(knobObj.max, startVal + (deltaY / sensitivity) * range));

        knobObj.val = newVal;
        this.updateKnobVisual(key, newVal);
        this.applyKnobAudio(key, newVal);
      };

      const onPointerUp = () => {
        isDragging = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
      };

      knobObj.el.addEventListener('mousedown', onPointerDown);
      knobObj.el.addEventListener('touchstart', onPointerDown, { passive: true });

      knobObj.el.addEventListener('wheel', (e) => {
        e.preventDefault();
        const range = knobObj.max - knobObj.min;
        const step = range * 0.05 * (e.deltaY < 0 ? 1 : -1);
        const newVal = Math.max(knobObj.min, Math.min(knobObj.max, knobObj.val + step));
        knobObj.val = newVal;
        this.updateKnobVisual(key, newVal);
        this.applyKnobAudio(key, newVal);
      });
    });
  }

  updateKnobVisual(name, value) {
    const knob = this.knobs[name];
    if (!knob || !knob.el) return;

    const norm = (value - knob.min) / (knob.max - knob.min);
    const angle = -135 + norm * 270;

    const pointer = knob.el.querySelector('.knob-pointer') || knob.el;
    pointer.style.transform = `rotate(${angle}deg)`;

    let display = '';
    if (knob.type === 'vol') display = `${Math.round(value * 100)}%`;
    else if (knob.type === 'bal') display = value === 0 ? 'CENTER' : (value < 0 ? `L ${Math.abs(Math.round(value * 100))}%` : `R ${Math.round(value * 100)}%`);
    else if (knob.type === 'eq') display = `${value > 0 ? '+' : ''}${Math.round(value)} dB`;

    knob.el.setAttribute('data-value', display);
    knob.el.title = `${name.toUpperCase()}: ${display}`;
  }

  applyKnobAudio(name, value) {
    if (name === 'volume') this.audio.setVolume(value);
    else if (name === 'balance') this.audio.setBalance(value);
    else if (name === 'bass') this.audio.setBass(value);
    else if (name === 'treble') this.audio.setTreble(value);
  }

  updateTapeDeckUI(tape, track, side) {
    if (!tape) return;

    if (this.tapeTitle) this.tapeTitle.textContent = tape.title;
    if (this.tapeArtist) this.tapeArtist.textContent = track ? `${track.title} • ${track.artist}` : tape.subtitle;
    if (this.tapeSideBadge) this.tapeSideBadge.textContent = `SIDE ${side}`;
    if (this.tapeTypeBadge) this.tapeTypeBadge.textContent = tape.type || 'TYPE I NORMAL';

    if (this.tapeBody) {
      this.tapeBody.style.setProperty('--tape-primary-color', tape.themeColor || '#EA7C69');
      this.tapeBody.style.setProperty('--tape-accent-color', tape.accentColor || '#4E878C');
      this.tapeBody.style.setProperty('--tape-label-color', tape.labelColor || '#FAF2E6');
    }
  }

  updatePlaybackState(isPlaying) {
    if (isPlaying) {
      if (this.leftReel) this.leftReel.classList.add('is-spinning');
      if (this.rightReel) this.rightReel.classList.add('is-spinning');
      if (this.keys.play) this.keys.play.classList.add('is-pressed', 'is-active');
      if (this.keys.pause) this.keys.pause.classList.remove('is-pressed');
    } else {
      if (this.leftReel) this.leftReel.classList.remove('is-spinning');
      if (this.rightReel) this.rightReel.classList.remove('is-spinning');
      if (this.keys.play) this.keys.play.classList.remove('is-pressed', 'is-active');
    }
  }

  updateTapeSpoolProgression(currentTime, duration) {
    const progress = duration > 0 ? currentTime / duration : 0;
    const leftScale = 1.0 - progress * 0.65;
    const rightScale = 0.35 + progress * 0.65;

    if (this.leftTapeSpool) {
      this.leftTapeSpool.style.transform = `scale(${leftScale})`;
    }
    if (this.rightTapeSpool) {
      this.rightTapeSpool.style.transform = `scale(${rightScale})`;
    }

    this.updateCounter(currentTime);
  }

  startVUMeterLoop() {
    const animate = () => {
      const vuData = this.audio.getVUData();
      this.renderVUSegments(this.vuLedsLeft, vuData.leftLevel);
      this.renderVUSegments(this.vuLedsRight, vuData.rightLevel);
      this.vuAnimationId = requestAnimationFrame(animate);
    };
    this.vuAnimationId = requestAnimationFrame(animate);
  }

  renderVUSegments(segments, level) {
    const total = segments.length;
    const activeCount = Math.floor(level * total * 1.1);

    segments.forEach((seg, idx) => {
      if (idx < activeCount) {
        seg.classList.add('lit');
      } else {
        seg.classList.remove('lit');
      }
    });
  }
}

window.PlayerDeckController = PlayerDeckController;
