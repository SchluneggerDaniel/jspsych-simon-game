import React from 'react';
import { SimonConfig, SimonData, SimonSequence } from '../SimonPlugin';
import Board, { ResponseData } from './Board';

type Props = {
  trialConfig: SimonConfig;
  onFinish: (data: SimonData) => void;
};

export default function Root({ trialConfig, onFinish }: Props) {
  // Setup the callback method. This will signal back to jsPsych that the trial
  // is finished and trigger a cleanup.
  const boardCallback = (response: ResponseData) => {
    onFinish({
      sequence: trialConfig.sequence,
      mode: trialConfig.mode,
      response: response,
    });
  };

  return (
    <div>
      <Board
        onFinish={boardCallback}
        sequence={trialConfig.sequence}
        mode={trialConfig.mode}
      />
    </div>
  );
}
