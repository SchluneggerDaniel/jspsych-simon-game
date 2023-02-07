import { SimonButtonId, SimonSequence } from '../SimonPlugin';

export class SequenceTicker {
  private interval: number;
  private onTick: (id: SimonButtonId) => void;
  private onFinish: () => void;
  private expected: number;
  private running: boolean = true;
  private sequence: SimonSequence;
  private sequenceIndex: number = 0;

  constructor(
    onTick: (id: SimonButtonId) => void,
    sequence: SimonSequence,
    onFinish: () => void,
    interval: number
  ) {
    this.interval = interval;
    this.onTick = onTick;
    this.onFinish = onFinish;
    this.expected = Date.now() + interval;
    this.sequence = sequence;

    // First call
    onTick(sequence[this.sequenceIndex]);
    this.sequenceIndex++;

    // Request second call
    setTimeout(this.step, interval);
  }

  private step = () => {
    // If the timer was stopped by external force
    if (this.running === false) {
      return;
    }

    // Trigger callback
    this.onTick(this.sequence[this.sequenceIndex]);
    this.sequenceIndex++;

    // If this was the last tick
    if (this.sequenceIndex >= this.sequence.length) {
      this.onFinish();
      return;
    }

    // Calculate drift (positive for overshooting)
    const drift = Date.now() - this.expected;

    // Update expected time
    this.expected += this.interval;

    // Request next call
    setTimeout(this.step, Math.max(0, this.interval - drift));
  };

  public stop = () => {
    this.running = false;
  };
}
