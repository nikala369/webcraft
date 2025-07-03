import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomizerSoundService {
  private audioContext?: AudioContext;

  /** Play a futuristic spaceship-like whoosh. */
  play(opening: boolean = true): void {
    try {
      // Lazily create context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = this.audioContext;

      // On some browsers the context is suspended until user gesture; resume just in case.
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Layered oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc3.type = 'sawtooth';

      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      const g3 = ctx.createGain();
      g1.gain.value = 0.25;
      g2.gain.value = 0.12;
      g3.gain.value = 0.06;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 5;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.9, now + 0.05);
      const duration = opening ? 0.4 : 0.25;
      master.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Connect graph
      osc1.connect(g1).connect(filter);
      osc2.connect(g2).connect(filter);
      osc3.connect(g3).connect(filter);
      filter.connect(master).connect(ctx.destination);

      if (opening) {
        osc1.frequency.setValueAtTime(100, now);
        osc1.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        osc2.frequency.setValueAtTime(150, now);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        osc3.frequency.setValueAtTime(50, now);
        osc3.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      } else {
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        osc3.frequency.setValueAtTime(200, now);
        osc3.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      }

      // Subtle noise layer for richness
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3; // White noise scaled
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseSource.connect(noiseGain).connect(master);
      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // start/stop
      [osc1, osc2, osc3].forEach((o) => {
        o.start(now);
        o.stop(now + duration);
      });
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }
}
