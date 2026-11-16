/**
 * SoundFX - Procedural Web Audio API Sound Synthesizer for Banana Tales.
 * 
 * Generates 100% synthesized sound effects in real time using the browser's AudioContext.
 * Zero external audio files / MP3s needed!
 */
export class SoundFX {
  private static ctx: AudioContext | null = null;
  public static isMuted: boolean = false;
  private static footstepIndex: number = 0;

  /**
   * Lazily initializes and returns the Web Audio AudioContext.
   */
  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Toggles the global sound mute state.
   */
  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * 1. Warm, pleasant marimba-style footstep.
   * Cycles through pentatonic notes (C4, D4, E4, G4, A4) with a wooden mallet resonance.
   */
  public static playFootstep(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00];
    const freq = pentatonic[this.footstepIndex % pentatonic.length];
    this.footstepIndex++;

    // Fundamental wooden resonance (warm sine/triangle)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Warm wooden acoustic filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    // Fast mallet attack, quick organic decay
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    // Mallet wood click transient (high wooden overtone)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(freq * 3.8, t);
    clickGain.gain.setValueAtTime(0.08, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
    clickOsc.start(t);
    clickOsc.stop(t + 0.03);
  }

  /**
   * 2. Bright ascending chime when grabbing a golden banana.
   * 4-note ascending crystalline sparkle (E5, G#5, B5, E6).
   */
  public static playBananaChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [659.25, 830.61, 987.77, 1318.51]; // E major arpeggio
    const t = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.045;

      // Primary crystalline bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Shimmering harmonic overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

      overtoneGain.gain.setValueAtTime(0.001, noteTime);
      overtoneGain.gain.linearRampToValueAtTime(0.04, noteTime + 0.006);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
      overtone.start(noteTime);
      overtone.stop(noteTime + 0.2);
    });
  }

  /**
   * 3. Wooden thud when extending a wooden bridge.
   * Solid timber thud with low-frequency thump and wood knock transient.
   */
  public static playBridgeThud(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Low wooden body thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    // Hard wood plank knock
    const knock = ctx.createOscillator();
    const knockGain = ctx.createGain();
    knock.type = 'sine';
    knock.frequency.setValueAtTime(380, t);
    knock.frequency.exponentialRampToValueAtTime(180, t + 0.05);

    knockGain.gain.setValueAtTime(0.15, t);
    knockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    knock.connect(knockGain);
    knockGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
    knock.start(t);
    knock.stop(t + 0.07);
  }

  /**
   * 4. Soft bonk on collision (water splash, rock, or bush).
   * Playful cartoon downward pitch bend.
   */
  public static playCollisionBonk(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * 5. Cheerful 4-note fanfare on level completion.
   * Triumphant brassy / chime fanfare: G4 -> C5 -> E5 -> G5.
   */
  public static playFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const fanfareNotes = [
      { freq: 392.00, start: 0, dur: 0.12 },     // G4
      { freq: 523.25, start: 0.13, dur: 0.12 },  // C5
      { freq: 659.25, start: 0.26, dur: 0.14 },  // E5
      { freq: 783.99, start: 0.42, dur: 0.65 }   // G5 (held finale)
    ];

    fanfareNotes.forEach((note) => {
      const startTime = t + note.start;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(note.freq, startTime);

      // Sweet octave harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(note.freq * 2, startTime);

      gain1.gain.setValueAtTime(0.001, startTime);
      gain1.gain.linearRampToValueAtTime(0.22, startTime + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      gain2.gain.setValueAtTime(0.001, startTime);
      gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur * 0.85);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + note.dur + 0.05);
      osc2.start(startTime);
      osc2.stop(startTime + note.dur + 0.05);
    });
  }
}
