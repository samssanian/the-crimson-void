/**
 * Procedural Web Audio API SoundEngine & Anime Battle Music Sequencer.
 * Zero external audio assets — all SFX & music are synthesized in real time.
 */

const STORAGE_MUTED_KEY = 'crimson_void_muted';
const STORAGE_MUSIC_KEY = 'crimson_void_music';

export type SoundName =
  | 'hover'
  | 'hoverOut'
  | 'click'
  | 'select'
  | 'success'
  | 'sent'
  | 'notify'
  | 'fight'
  | 'whoosh'
  | 'shing'
  | 'boom'
  | 'charge'
  | 'sparkle'
  | 'pop'
  | 'error'
  | 'tick'
  | 'pageFlip'
  | 'whisper'
  | 'ambientHum'
  | 'addToCart'
  | 'removeFromCart'
  | 'cartOpen'
  | 'cartClose'
  | 'checkoutStart'
  | 'checkoutSuccess'
  | 'orderNotify'
  | 'productHover'
  | 'productSelect'
  | 'errorBuzz';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted: boolean = false;
  private musicPlaying: boolean = false;
  private volume: number = 0.7;

  // Sequencer nodes & timers
  private seqTimer: number | null = null;
  private droneOsc: OscillatorNode | null = null;
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private arpStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.muted = window.localStorage.getItem(STORAGE_MUTED_KEY) === 'true';
      } catch {
        this.muted = false;
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    try {
      window.localStorage.setItem(STORAGE_MUTED_KEY, String(mute));
    } catch {
      // Ignore storage failures
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : this.volume, this.ctx.currentTime, 0.04);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.04);
    }
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public play(name: SoundName): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;

    switch (name) {
      case 'hover': {
        this.tone(ctx, 'sine', 640, 820, 0.06, 0.06, now);
        break;
      }
      case 'hoverOut': {
        this.tone(ctx, 'sine', 520, 380, 0.05, 0.04, now);
        break;
      }
      case 'click': {
        this.tone(ctx, 'triangle', 480, 220, 0.07, 0.14, now);
        break;
      }
      case 'select': {
        this.tone(ctx, 'triangle', 520, 780, 0.1, 0.15, now);
        this.tone(ctx, 'sine', 780, 1040, 0.12, 0.12, now + 0.05);
        break;
      }
      case 'success': {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          this.tone(ctx, 'triangle', freq, freq, 0.14, 0.14, now + i * 0.07);
        });
        break;
      }
      case 'sent': {
        this.tone(ctx, 'sine', 440, 880, 0.18, 0.16, now);
        this.tone(ctx, 'triangle', 880, 1320, 0.2, 0.14, now + 0.09);
        break;
      }
      case 'notify': {
        this.tone(ctx, 'sine', 880, 880, 0.08, 0.12, now);
        this.tone(ctx, 'sine', 1174.66, 1174.66, 0.16, 0.12, now + 0.09);
        break;
      }
      case 'fight': {
        this.play('shing');
        this.play('boom');
        this.tone(ctx, 'sawtooth', 220, 880, 0.25, 0.18, now);
        break;
      }
      case 'whoosh': {
        this.noiseSweep(ctx, 250, 2200, 0.24, 0.18, now);
        break;
      }
      case 'shing': {
        this.tone(ctx, 'sine', 2400, 4800, 0.18, 0.16, now);
        this.tone(ctx, 'triangle', 3200, 1800, 0.24, 0.14, now + 0.03);
        this.noiseSweep(ctx, 3000, 7500, 0.2, 0.14, now);
        break;
      }
      case 'boom': {
        this.tone(ctx, 'sine', 135, 32, 0.55, 0.42, now);
        this.tone(ctx, 'triangle', 90, 28, 0.45, 0.25, now);
        this.noiseSweep(ctx, 400, 70, 0.35, 0.22, now);
        break;
      }
      case 'charge': {
        this.tone(ctx, 'sawtooth', 160, 960, 0.48, 0.14, now);
        this.tone(ctx, 'sine', 320, 1280, 0.48, 0.12, now);
        break;
      }
      case 'sparkle': {
        [1318, 1568, 2093, 2637].forEach((freq, i) => {
          this.tone(ctx, 'sine', freq, freq * 1.04, 0.11, 0.08, now + i * 0.045);
        });
        break;
      }
      case 'pop': {
        this.tone(ctx, 'sine', 300, 680, 0.07, 0.16, now);
        break;
      }
      case 'error': {
        this.tone(ctx, 'sawtooth', 210, 140, 0.14, 0.18, now);
        this.tone(ctx, 'sawtooth', 175, 110, 0.18, 0.18, now + 0.12);
        break;
      }
      case 'tick': {
        this.tone(ctx, 'square', 1100, 700, 0.025, 0.06, now);
        break;
      }
      case 'pageFlip': {
        this.noiseSweep(ctx, 900, 3200, 0.14, 0.12, now);
        this.tone(ctx, 'sine', 420, 610, 0.1, 0.07, now + 0.02);
        break;
      }
      case 'whisper': {
        this.noiseSweep(ctx, 600, 1400, 0.1, 0.04, now);
        this.tone(ctx, 'sine', 330, 345, 0.12, 0.03, now);
        break;
      }
      case 'ambientHum': {
        this.tone(ctx, 'sine', 55, 58, 1.4, 0.1, now);
        this.tone(ctx, 'triangle', 110, 112, 1.4, 0.05, now);
        break;
      }
      case 'addToCart': {
        this.tone(ctx, 'sine', 360, 760, 0.07, 0.16, now);
        this.tone(ctx, 'triangle', 987.77, 1318.51, 0.14, 0.14, now + 0.055);
        break;
      }
      case 'removeFromCart': {
        this.tone(ctx, 'sine', 560, 210, 0.16, 0.14, now);
        this.noiseSweep(ctx, 1400, 340, 0.15, 0.09, now);
        break;
      }
      case 'cartOpen': {
        this.noiseSweep(ctx, 320, 2600, 0.22, 0.14, now);
        this.tone(ctx, 'sine', 420, 840, 0.16, 0.09, now + 0.02);
        break;
      }
      case 'cartClose': {
        this.noiseSweep(ctx, 2200, 280, 0.2, 0.13, now);
        this.tone(ctx, 'sine', 680, 340, 0.14, 0.08, now + 0.02);
        break;
      }
      case 'checkoutStart': {
        this.tone(ctx, 'sawtooth', 190, 880, 0.42, 0.13, now);
        this.tone(ctx, 'sine', 380, 1140, 0.42, 0.11, now);
        break;
      }
      case 'checkoutSuccess': {
        this.play('boom');
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          this.tone(ctx, 'triangle', freq, freq, 0.16, 0.15, now + 0.08 + i * 0.07);
        });
        [1568, 2093, 2637].forEach((freq, i) => {
          this.tone(ctx, 'sine', freq, freq * 1.05, 0.12, 0.08, now + 0.34 + i * 0.045);
        });
        break;
      }
      case 'orderNotify': {
        [783.99, 987.77, 1318.51].forEach((freq, i) => {
          this.tone(ctx, 'sine', freq, freq, 0.11, 0.13, now + i * 0.08);
        });
        break;
      }
      case 'productHover': {
        this.tone(ctx, 'square', 980, 620, 0.022, 0.04, now);
        break;
      }
      case 'productSelect': {
        this.tone(ctx, 'sine', 340, 720, 0.075, 0.15, now);
        break;
      }
      case 'errorBuzz': {
        this.tone(ctx, 'sawtooth', 165, 115, 0.14, 0.16, now);
        this.tone(ctx, 'square', 140, 98, 0.12, 0.08, now + 0.04);
        break;
      }
    }
  }

  private tone(
    ctx: AudioContext,
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number,
    startTime: number
  ): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (startFreq !== endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.015, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private noiseSweep(
    ctx: AudioContext,
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number,
    startTime: number
  ): void {
    if (!this.masterGain) return;
    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, duration + 0.05);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.6;
    filter.frequency.setValueAtTime(startFreq, startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), startTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(startTime);
    src.stop(startTime + duration + 0.03);
  }

  /**
   * Procedural 120 BPM Anime Battle Theme:
   * - Bass drone (55Hz A1)
   * - 4-note arpeggio (A3, C4, E4, A4)
   * - Hi-hat pulse
   * - Detuned pad + Lowpass filter + slow LFO
   * - Fade in 2s / fade out 1s at ~30% volume
   */
  public startMusic(): void {
    if (this.musicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.musicPlaying = true;
    try {
      window.localStorage.setItem(STORAGE_MUSIC_KEY, 'true');
    } catch {
      // Ignore storage failures
    }

    const now = ctx.currentTime;
    const musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(0.0001, now);
    musicGain.gain.linearRampToValueAtTime(0.3, now + 2.0);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1100, now);
    lowpass.Q.value = 2.4;

    // Slow LFO modulating lowpass cutoff
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.25;
    lfoGain.gain.value = 450;
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start(now);

    lowpass.connect(musicGain);
    musicGain.connect(this.masterGain);

    // 55Hz Bass Drone
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.value = 55;
    droneGain.gain.value = 0.16;
    drone.connect(droneGain);
    droneGain.connect(lowpass);
    drone.start(now);

    // Detuned Pad
    const pad1 = ctx.createOscillator();
    const pad2 = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad1.type = 'triangle';
    pad2.type = 'triangle';
    pad1.frequency.value = 110;
    pad2.frequency.value = 110.9;
    padGain.gain.value = 0.12;
    pad1.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(lowpass);
    pad1.start(now);
    pad2.start(now);

    this.musicGain = musicGain;
    this.droneOsc = drone;
    this.padOsc1 = pad1;
    this.padOsc2 = pad2;
    this.lfoOsc = lfo;
    this.arpStep = 0;

    // 120 BPM eighth-note step = 250ms
    const arpNotes = [220.0, 261.63, 329.63, 440.0]; // A3, C4, E4, A4
    this.seqTimer = window.setInterval(() => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const note = arpNotes[this.arpStep % arpNotes.length];

      // Arpeggio synth pulse
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.14, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.21);
      osc.connect(g);
      g.connect(lowpass);
      osc.start(t);
      osc.stop(t + 0.23);

      // Crisp hi-hat on off-beats and beats
      const hat = this.ctx.createBufferSource();
      hat.buffer = this.createNoiseBuffer(this.ctx, 0.05);
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 6500;
      const hg = this.ctx.createGain();
      hg.gain.setValueAtTime(this.arpStep % 2 === 1 ? 0.06 : 0.03, t);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      hat.connect(hp);
      hp.connect(hg);
      hg.connect(this.musicGain);
      hat.start(t);
      hat.stop(t + 0.05);

      this.arpStep = (this.arpStep + 1) % 16;
    }, 250);
  }

  public stopMusic(): void {
    if (!this.musicPlaying) return;
    this.musicPlaying = false;
    try {
      window.localStorage.setItem(STORAGE_MUSIC_KEY, 'false');
    } catch {
      // Ignore
    }
    if (this.seqTimer !== null) {
      window.clearInterval(this.seqTimer);
      this.seqTimer = null;
    }
    const ctx = this.ctx;
    const gain = this.musicGain;
    const oscs = [this.droneOsc, this.padOsc1, this.padOsc2, this.lfoOsc];
    this.droneOsc = null;
    this.padOsc1 = null;
    this.padOsc2 = null;
    this.lfoOsc = null;
    this.musicGain = null;

    if (ctx && gain) {
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
      window.setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o?.stop();
          } catch {
            // already stopped
          }
        });
      }, 1050);
    } else {
      oscs.forEach((o) => {
        try {
          o?.stop();
        } catch {
          // already stopped
        }
      });
    }
  }

  public toggleMusic(): boolean {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    }
    this.startMusic();
    return true;
  }
}

export const soundEngine = new SoundEngine();
