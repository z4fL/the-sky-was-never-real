/** Original, quiet synthesis. Created only by a visitor's sound-button gesture. */
export class Ambience {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noise: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private enabled = false;

  async toggle() {
    if (!this.context) this.create();
    await this.context!.resume();
    this.enabled = !this.enabled;
    this.master!.gain.setTargetAtTime(this.enabled ? 0.11 : 0, this.context!.currentTime, 0.8);
    return this.enabled;
  }

  update(progress: number) {
    if (!this.context || !this.enabled) return;
    const t = this.context.currentTime;
    const tension = Math.sin(progress * Math.PI);
    this.filter!.frequency.setTargetAtTime(220 + tension * 350, t, 1.5);
    this.oscillators.forEach((osc, i) => osc.detune.setTargetAtTime(tension * (i % 2 ? -7 : 5), t, 2));
  }

  async pause(hidden: boolean) {
    if (!this.context) return;
    if (hidden) await this.context.suspend();
    else if (this.enabled) await this.context.resume();
  }

  private create() {
    this.context = new AudioContext();
    const ctx = this.context;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    [55, 82.4069, 110, 164.8138].forEach((frequency, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = frequency;
      gain.gain.value = i === 0 ? 0.26 : 0.09;
      osc.connect(gain); gain.connect(this.master!); osc.start();
      this.oscillators.push(osc);
    });
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
      data[i] = last * 2;
    }
    this.noise = ctx.createBufferSource(); this.noise.buffer = buffer; this.noise.loop = true;
    this.filter = ctx.createBiquadFilter(); this.filter.type = "lowpass"; this.filter.frequency.value = 220;
    const wind = ctx.createGain(); wind.gain.value = 0.2;
    this.noise.connect(this.filter); this.filter.connect(wind); wind.connect(this.master); this.noise.start();
  }

  dispose() {
    this.oscillators.forEach(osc => osc.stop());
    this.noise?.stop();
    void this.context?.close();
    this.context = null;
  }
}
