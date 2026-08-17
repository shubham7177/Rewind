/**
 * REWIND - Web Audio & YouTube Iframe Audio Engine
 * Dedicated YouTube audio player with synchronized VU meters, mechanical SFX,
 * and reliable instant autoplay on track change / library selection.
 */

class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;

    // Player State
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentTape = null;
    this.currentSide = 'A';
    this.currentTime = 0;
    this.duration = 200;
    this.playbackRate = 1.0;
    this.timerInterval = null;

    // YouTube Iframe Player
    this.ytPlayer = null;
    this.isYtReady = false;
    this.isInitialized = false;

    // Callbacks
    this.onTimeUpdate = null;
    this.onTrackEnd = null;

    this.initYouTubeAPI();
  }

  initYouTubeAPI() {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      let dock = document.getElementById('yt-audio-dock');
      if (!dock) {
        dock = document.createElement('div');
        dock.id = 'yt-audio-dock';
        dock.style.cssText = 'position:fixed;bottom:-200px;left:-200px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-100;';
        document.body.appendChild(dock);
      }

      try {
        this.ytPlayer = new window.YT.Player('yt-audio-dock', {
          height: '100',
          width: '100',
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'autoplay': 1,
            'origin': window.location.origin
          },
          events: {
            'onReady': () => {
              this.isYtReady = true;
              if (this.currentTrack && this.currentTrack.youtubeId) {
                if (this.isPlaying) {
                  this.ytPlayer.loadVideoById({ videoId: this.currentTrack.youtubeId, startSeconds: 0 });
                } else {
                  this.ytPlayer.cueVideoById(this.currentTrack.youtubeId);
                }
              }
            },
            'onStateChange': (event) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                if (this.onTrackEnd) this.onTrackEnd();
              } else if (event.data === 1) {
                // Playing
                this.isPlaying = true;
                const d = this.ytPlayer.getDuration();
                if (d && !isNaN(d) && d > 0) {
                  this.duration = d;
                }
              } else if (event.data === 2) {
                // Paused
              }
            },
            'onError': (e) => {
              console.warn("YouTube Player Error:", e);
            }
          }
        });
      } catch (e) {
        console.warn("YouTube Player initialization:", e);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }
  }

  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API initialization:", e);
    }
  }

  setVolume(val) {
    if (this.ytPlayer && this.isYtReady && this.ytPlayer.setVolume) {
      this.ytPlayer.setVolume(Math.round(val * 100));
    }
  }

  setBalance(val) {}
  setBass(db) {}
  setTreble(db) {}
  setDolbyNR(enabled) {}
  toggleHiss() { return false; }

  setPlaybackSpeed(speed) {
    this.playbackRate = speed;
    if (this.ytPlayer && this.isYtReady && this.ytPlayer.setPlaybackRate) {
      this.ytPlayer.setPlaybackRate(speed);
    }
  }

  loadTrack(track, tape, side = 'A', autoPlay = false) {
    this.currentTrack = track;
    this.currentTape = tape;
    this.currentSide = side;
    this.currentTime = 0;
    this.duration = track.duration || 210;

    if (autoPlay) {
      this.isPlaying = true;
    }

    if (track.youtubeId && this.ytPlayer && this.isYtReady) {
      if (autoPlay || this.isPlaying) {
        try {
          if (this.ytPlayer.loadVideoById) {
            this.ytPlayer.loadVideoById({
              videoId: track.youtubeId,
              startSeconds: 0
            });
          }
          if (this.ytPlayer.playVideo) {
            this.ytPlayer.playVideo();
          }
        } catch (e) {
          console.warn("Could not loadVideoById directly:", e);
        }
      } else {
        if (this.ytPlayer.cueVideoById) {
          this.ytPlayer.cueVideoById(track.youtubeId);
        }
      }
    }
  }

  play() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;

    if (this.currentTrack && this.currentTrack.youtubeId && this.ytPlayer && this.isYtReady) {
      try {
        if (this.ytPlayer.loadVideoById && this.currentTime === 0) {
          this.ytPlayer.loadVideoById({
            videoId: this.currentTrack.youtubeId,
            startSeconds: 0
          });
        } else if (this.ytPlayer.playVideo) {
          this.ytPlayer.playVideo();
        }
      } catch (e) {
        if (this.ytPlayer.playVideo) {
          this.ytPlayer.playVideo();
        }
      }
    }

    this.startTimer();
  }

  pause() {
    this.isPlaying = false;
    if (this.ytPlayer && this.isYtReady && this.ytPlayer.pauseVideo) {
      this.ytPlayer.pauseVideo();
    }
    this.stopTimer();
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    if (this.ytPlayer && this.isYtReady && this.ytPlayer.stopVideo) {
      this.ytPlayer.stopVideo();
    }
    this.stopTimer();
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, this.duration);
    }
  }

  seek(targetSeconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, targetSeconds));
    if (this.currentTrack && this.currentTrack.youtubeId && this.ytPlayer && this.isYtReady && this.ytPlayer.seekTo) {
      this.ytPlayer.seekTo(targetSeconds, true);
    }
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, this.duration);
    }
  }

  startTimer() {
    this.stopTimer();
    const intervalMs = 150;
    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;

      if (this.currentTrack && this.currentTrack.youtubeId && this.ytPlayer && this.isYtReady && this.ytPlayer.getCurrentTime) {
        const curr = this.ytPlayer.getCurrentTime();
        const dur = this.ytPlayer.getDuration();
        if (curr !== undefined && !isNaN(curr) && curr >= 0) {
          this.currentTime = curr;
        }
        if (dur !== undefined && !isNaN(dur) && dur > 0) {
          this.duration = dur;
        }
      } else {
        this.currentTime += (intervalMs / 1000) * this.playbackRate;
      }

      if (this.currentTime >= this.duration && this.duration > 0) {
        this.currentTime = this.duration;
        if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
        if (this.onTrackEnd) this.onTrackEnd();
      } else {
        if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
      }
    }, intervalMs);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Real-time animated VU meter data synchronized with music playback
  getVUData() {
    if (!this.isPlaying) {
      return { leftLevel: 0.02, rightLevel: 0.02, peakLeft: 0, peakRight: 0 };
    }

    const t = (this.currentTime || 0) * 3.5;
    const wave1 = (Math.sin(t * 2.2) + Math.sin(t * 4.7) + 2) / 4;
    const wave2 = (Math.cos(t * 2.8) + Math.sin(t * 5.3) + 2) / 4;
    const jitter = Math.random() * 0.12;

    const leftLevel = Math.min(1.0, Math.max(0.15, wave1 * 0.85 + jitter));
    const rightLevel = Math.min(1.0, Math.max(0.15, wave2 * 0.88 + jitter));

    return {
      leftLevel,
      rightLevel,
      peakLeft: Math.min(1.0, leftLevel * 1.15),
      peakRight: Math.min(1.0, rightLevel * 1.15)
    };
  }

  // --- Tactile Mechanical Sound Effects (SFX) ---
  playKeyClick(isRelease = false) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isRelease ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isRelease ? 650 : 1200, now);
    osc.frequency.exponentialRampToValueAtTime(isRelease ? 150 : 220, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playTapeClunk() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    setTimeout(() => {
      if (!this.ctx) return;
      const snapTime = this.ctx.currentTime;
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(2400, snapTime);
      snapOsc.frequency.exponentialRampToValueAtTime(400, snapTime + 0.05);

      snapGain.gain.setValueAtTime(0.3, snapTime);
      snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.06);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(snapTime);
      snapOsc.stop(snapTime + 0.07);
    }, 60);
  }

  playTapeEject() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playMotorWhirr(isRewind = false) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    const startFreq = isRewind ? 280 : 350;
    const endFreq = isRewind ? 880 : 1100;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(endFreq, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playCounterReset() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const tickTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400 + i * 150, tickTime);
        gain.gain.setValueAtTime(0.18, tickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(tickTime);
        osc.stop(tickTime + 0.03);
      }, i * 35);
    }
  }

  playTapeFlip() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.15);
  }
}

window.RetroAudioEngine = RetroAudioEngine;
