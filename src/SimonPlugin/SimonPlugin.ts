import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from 'jspsych';

// Import React related code
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ResponseData } from './components/Board';

// Import react components
import { Board } from './components/Board';

// Define types for plugin config and data
export type SimonButtonId = 0 | 1 | 2 | 3;
export type SimonSequence = SimonButtonId[];
export type SimonMode = 'visual' | 'audiovisual';

export type SimonConfig = {
  sequence: SimonSequence;
  mode: SimonMode;
};

export type SimonData = SimonConfig & ResponseData;

const info = <const>{
  name: 'simon',
  parameters: {
    config: {
      type: ParameterType.OBJECT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
  },
};

type Info = typeof info;

/**
 * **simon**
 *
 * Presents a sequence of (audio-)visual stimuli and records the participant's
 * reproduction of this sequence. Check out the game Simon to get an idea.
 *
 * - https://en.wikipedia.org/wiki/Simon_(game)
 *
 * @author Robin Bürkli
 * @see {@link https://github.com/kogpsy/jspsych-simon-task Docs on GitHub}
 */
class SimonPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Grab and cast trial config
    const config = trial.config as SimonConfig;

    // Setup React to render the plugin root
    const reactRoot = createRoot(document.getElementById('jspsych-content')!);
    reactRoot.render(
      React.createElement(
        Board,
        {
          config,
          onFinish: (response) => {
            reactRoot.unmount();
            this.jsPsych.finishTrial({ ...config, ...response });
          },
        },
        null
      )
    );
  }
}

export default SimonPlugin;
