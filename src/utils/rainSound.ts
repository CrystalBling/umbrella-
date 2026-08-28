// Aesthetic ambient weather sound generator using Web Audio API
class WeatherSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public toggleRainSound(isPlaying: boolean, intensity: number = 0.5) {
    if (isPlaying) {
      this.startRain(intensity);
    } else {
      this.stopRain();
    }
  }

  private startRain(intensity: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) {
        if (this.gainNode) {
          this.gainNode.gain.setTargetAtTime(Math.min(0.2, intensity * 0.15), this.ctx.currentTime, 0.5);
        }
        return;
      }

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate pink noise for soft realistic rain patter
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter to simulate rain drops on foliage/rooftop
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850 + intensity * 600, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.min(0.2, intensity * 0.12), this.ctx.currentTime + 1.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(0);

      this.noiseNode = whiteNoise;
      this.gainNode = gain;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  private stopRain() {
    if (!this.isPlaying || !this.gainNode || !this.ctx) return;
    try {
      this.gainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        if (this.noiseNode) {
          (this.noiseNode as any).stop?.();
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        this.isPlaying = false;
      }, 700);
    } catch (e) {
      this.isPlaying = false;
    }
  }
}

export const rainSound = new WeatherSoundEngine();
