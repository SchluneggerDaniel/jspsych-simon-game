import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import Button from './Button';
import { SimonButtonId, SimonMode, SimonSequence } from '../SimonPlugin';
import { SequenceTicker } from '../utils/SequenceTicker';

const INTERVAL = 270;
const BLINK_DURATION = 220;

const containerStyle = css`
  width: 75vh;
  height: 75vh;
  position: relative;
`;

const cutoutStyle = css`
  width: 50%;
  height: 50%;
  background-color: black;
  position: absolute;
  top: 25%;
  left: 25%;
  border-radius: 50%;
  pointer-events: all;
`;

export type ResponseData = {
  button: SimonButtonId;
  delta_time: number;
}[];

type Props = {
  onFinish: (response: ResponseData) => void;
  sequence: SimonSequence;
  mode: SimonMode;
};

export default function Board({ onFinish, sequence, mode }: Props) {
  const [captureResponses, setCaptureResponses] = useState(false);
  const [highlightState, setHighlightState] = useState<
    [boolean, boolean, boolean, boolean]
  >([false, false, false, false]);

  // Instantiate ref to store response data
  const response = useRef<ResponseData>([]);
  // Another one to store response timing data
  const lastResponse = useRef(0);

  // Instantiate web audio context for audiovisual mode
  const audioContext = useRef<AudioContext>(new AudioContext());

  // On first mount, setup a timer that will make buttons blink in sequence
  // order
  useEffect(() => {
    new SequenceTicker(
      // On tick
      (id: SimonButtonId) => {
        if (mode === 'audiovisual') {
          emitTone(id, audioContext.current);
        }
        setHighlightState([0 === id, 1 === id, 2 === id, 3 === id]);
        setTimeout(() => {
          setHighlightState([false, false, false, false]);
        }, BLINK_DURATION);
      },
      sequence,
      // On finish
      () => {
        setCaptureResponses(true);
        lastResponse.current = Date.now();
      },
      INTERVAL
    );
  }, []);

  // On touch start event handler for buttons
  const onTouchStart = (id: SimonButtonId) => {
    if (captureResponses) {
      const now = Date.now();
      // Log in response
      response.current.push({
        button: id,
        delta_time: now - lastResponse.current,
      });
      // Update last response time
      lastResponse.current = now;
      // Give visual feedback
      setHighlightState([0 === id, 1 === id, 2 === id, 3 === id]);
      // If in audiovisual mode, also give auditive feedback
      if (mode === 'audiovisual') {
        emitTone(id, audioContext.current);
      }
    }
  };

  // On touch end event handler for buttons
  const onTouchEnd = (id: SimonButtonId) => {
    if (captureResponses) {
      setHighlightState([false, false, false, false]);
      if (response.current.length === sequence.length) {
        onFinish(response.current);
      }
    }
  };

  return (
    <div className={containerStyle}>
      {/* Create 4 buttons */}
      {([0, 1, 2, 3] as SimonButtonId[]).map((buttonId: SimonButtonId) => {
        return (
          <Button
            id={buttonId}
            key={`button-${buttonId}`}
            highlighted={highlightState[buttonId]}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />
        );
      })}
      <div className={cutoutStyle}></div>
    </div>
  );
}

// The frequencies of the audio for audiovisual mode
// Array index corresponds to button ID
const frequencies = [261.626, 195.998, 329.628, 391.995];

// Emits a tone for a certain button id on a certain web audio context
const emitTone = (id: SimonButtonId, context: AudioContext) => {
  // Create OscillatorNode, and connect to audio context
  let osc = context.createOscillator();
  osc.connect(context.destination);
  // Set the oscillator parameters
  osc.frequency.value = frequencies[id];
  osc.type = 'square';
  // Play a sound for 2 seconds
  osc.start();
  osc.stop(context.currentTime + BLINK_DURATION / 1000);
};
