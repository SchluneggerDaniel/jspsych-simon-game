import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from 'jspsych';

// Import React related code
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ResponseData } from './components/Board';

// Import react components
import { default as RootComponent } from './components/Root';

// Define types for plugin config and data
export type SimonButtonId = 0 | 1 | 2 | 3;
export type SimonSequence = SimonButtonId[];
export type SimonMode = 'visual' | 'audiovisual';

export type SimonConfig = {
  sequence: SimonSequence;
  mode: SimonMode;
};

export type SimonData = {
  sequence: SimonSequence;
  mode: SimonMode;
  response: ResponseData;
};

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
    const rootElement = document.createElement('div');
    display_element.appendChild(rootElement);
    const reactRoot = createRoot(rootElement);
    reactRoot.render(
      React.createElement(
        RootComponent,
        {
          trialConfig: config,
          onFinish: (trialData) => {
            finishTrial(this.jsPsych, reactRoot, trialData);
          },
        },
        null
      )
    );
  }
}

const finishTrial = (
  jsPsychInstance: JsPsych,
  reactRoot: Root,
  data: SimonData
) => {
  // Unmount react
  reactRoot.unmount();
  // End trial
  jsPsychInstance.finishTrial(data);
};

export default SimonPlugin;
