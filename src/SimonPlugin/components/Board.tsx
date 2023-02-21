import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import Button from './Button';
import { SimonButtonId, SimonConfig } from '../SimonPlugin';

import delay from 'delay';

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

type ButtonPressResponse = {
  button: SimonButtonId;
  delta_time: number;
};

export type ResponseData = {
  response: ButtonPressResponse[];
  rt: number;
};

type Props = {
  onFinish: (response: ResponseData) => void;
  config: SimonConfig;
};

export const Board: React.FC<Props> = ({
  onFinish,
  config: { sequence, mode },
}) => {
  const [captureResponses, setCaptureResponses] = useState(false);
  const [highlightedButtonId, setHighlightedButtonId] = useState<number | null>(
    null
  );

  const response = useRef<ButtonPressResponse[]>([]).current;

  // Instantiate refs to store response timing data
  const lastResponseTime = useRef(0);
  const startTime = useRef(0);

  // Instantiate web audio context for audiovisual mode
  const audioContext = useRef<AudioContext>(new AudioContext());

  // On first mount, make buttons blink in sequence order
  useEffect(() => {
    (async () => {
      for (const [sequenceItemId, buttonId] of sequence.entries()) {
        if (mode === 'audiovisual') {
          emitTone(buttonId, audioContext.current);
        }

        setHighlightedButtonId(buttonId);
        await delay(BLINK_DURATION);
        setHighlightedButtonId(null);

        if (sequenceItemId < sequence.length) {
          await delay(INTERVAL - BLINK_DURATION);
        }
      }

      setCaptureResponses(true);
      lastResponseTime.current = startTime.current = Date.now();
    })();
  }, []);

  // On touch start event handler for buttons
  const onTouchStart = (buttonId: SimonButtonId) => {
    if (captureResponses) {
      const now = Date.now();
      // Log in response
      response.push({
        button: buttonId,
        delta_time: now - lastResponseTime.current,
      });
      // Update last response time
      lastResponseTime.current = now;
      // Give visual feedback
      setHighlightedButtonId(buttonId);
      // If in audiovisual mode, also give auditive feedback
      if (mode === 'audiovisual') {
        emitTone(buttonId, audioContext.current);
      }
    }
  };

  // On touch end event handler for buttons
  const onTouchEnd = (id: SimonButtonId) => {
    if (captureResponses) {
      setHighlightedButtonId(null);
      if (
        response.length === sequence.length ||
        id !== sequence[response.length - 1]
      ) {
        onFinish({
          response,
          rt: lastResponseTime.current - startTime.current,
        });
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
            highlighted={highlightedButtonId === buttonId}
            onTouchStart={() => {
              onTouchStart(buttonId);
            }}
            onTouchEnd={() => {
              onTouchEnd(buttonId);
            }}
          />
        );
      })}
      <div className={cutoutStyle}></div>
    </div>
  );
};

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
