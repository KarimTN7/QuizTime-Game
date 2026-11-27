import { SoundCueKey } from '../types/game';

class WebAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private gainScale(volumePercent: number): number {
    return Math.max(0, Math.min(1, volumePercent / 100)) * 0.25;
  }

  private playTone(
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx || volume <= 0) return;

    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCorrect(volumePercent: number) {
    const v = this.gainScale(volumePercent);
    this.playTone(523.25, 0, 0.14, 'triangle', v);
    this.playTone(659.25, 0.09, 0.18, 'triangle', v);
    this.playTone(783.99, 0.18, 0.24, 'sine', v);
  }

  public playWrong(volumePercent: number) {
    const v = this.gainScale(volumePercent);
    this.playTone(220, 0, 0.16, 'sawtooth', v * 0.7, 175);
    this.playTone(170, 0.14, 0.22, 'sawtooth', v * 0.7, 130);
  }

  public playTick(volumePercent: number) {
    const v = this.gainScale(volumePercent) * 0.55;
    this.playTone(980, 0, 0.045, 'sine', v);
  }

  public playVictory(volumePercent: number) {
    const v = this.gainScale(volumePercent);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      this.playTone(freq, idx * 0.1, 0.35, 'triangle', v);
    });
  }

  public playCue(cue: SoundCueKey, volumePercent: number) {
    const v = Math.max(0.08, this.gainScale(volumePercent || 70));
    switch (cue) {
      case 'coin_arcade':
        this.playTone(987.77, 0, 0.09, 'square', v * 0.65);
        this.playTone(1318.51, 0.08, 0.32, 'square', v * 0.65);
        break;
      case 'level_up_fanfare':
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          this.playTone(f, i * 0.11, 0.22, 'triangle', v);
        });
        break;
      case 'power_down_retro':
        [523.25, 440, 349.23, 261.63, 196].forEach((f, i) => {
          this.playTone(f, i * 0.1, 0.14, 'square', v * 0.6);
        });
        break;
      case 'boss_warning_alarm':
        for (let i = 0; i < 4; i++) {
          this.playTone(150, i * 0.34, 0.24, 'sawtooth', v * 0.85, 110);
        }
        break;
      case 'radar_ping_sonar':
        this.playTone(1180, 0, 0.65, 'sine', v * 0.9);
        this.playTone(1180, 0.85, 0.55, 'sine', v * 0.45);
        break;
      case 'victory_chord_major':
        this.playTone(261.63, 0, 0.9, 'triangle', v * 0.8);
        this.playTone(329.63, 0.02, 0.9, 'triangle', v * 0.8);
        this.playTone(392.0, 0.04, 0.9, 'triangle', v * 0.8);
        this.playTone(523.25, 0.06, 0.9, 'sine', v * 0.7);
        break;
      case 'countdown_tick_urgent':
        for (let i = 0; i < 5; i++) {
          this.playTone(i === 4 ? 1320 : 880, i * 0.28, 0.07, 'sine', v * 0.8);
        }
        break;
      default:
        this.playTone(587.33, 0, 0.25, 'triangle', v);
        this.playTone(880, 0.18, 0.35, 'triangle', v);
        break;
    }
  }
}

export const soundEngine = new WebAudioEngine();
