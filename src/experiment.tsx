/**
 * @title Simon Task
 * @description An experiment used to examine sequence learning with a paradigm based on the game "Simon".
 * @version 0.1.0
 *
 * The following lines specify which media directories will be packaged and
 * preloaded by jsPsych. Modify them to arbitrary paths (or comma-separated
 * lists of paths) within the `media` directory, or just delete them.
 * @assets media/images
 */

// Import stylesheets (.scss or .css).
import '../styles/main.scss';

import { initJsPsych } from 'jspsych';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import SurveyHtmlFormPlugin from '@jspsych/plugin-survey-html-form';
import PreloadPlugin from '@jspsych/plugin-preload';
import SimonPlugin from './SimonPlugin/SimonPlugin';
import { mainSequences, practiceSequences } from './data/sequences';
import { RunFunction } from 'jspsych-builder';

export const run: RunFunction = async ({ assetPaths, environment }) => {
  // Initiate the jsPsych object
  const jsPsych = initJsPsych();

  const ac = new AudioContext();

  // Define the main timeline array
  const timeline: any[] = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // Switch to fullscreen
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: true,
    message: renderToStaticMarkup(
      <div className="instruction">
        <p>Drücken Sie den Button, um den Vollbildmodus zu aktivieren.</p>
      </div>
    ),
  });

  // Instructions first part
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: renderToStaticMarkup(
      <div className="instruction">
        <p>
          <strong>Willkommen</strong>
        </p>
        <p>
          In diesem Experiment werden Sie farbige Knöpfe sehen, die in einer
          bestimmten Abfolge blinken (siehe Abbildung). Zum Teil wird das
          Blinken begleitet sein von einem akkustischen Ton. Ihre Aufgabe ist
          es, sich die Abfolge jeweils zu merken, und sie dann zu reproduzieren,
          indem Sie in der gleichen Reihenfolge auf die Knöpfe drücken, in der
          sie aufgeblinkt haben.
        </p>
        <div className="instruction-image">
          <img src="media/images/board.png" />
        </div>
      </div>
    ),
    button_label: 'Weiter',
  });

  // Instructions second part
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: renderToStaticMarkup(
      <div className="instruction">
        <p>
          Beim Reproduzieren der Sequenzen können Sie sich soviel Zeit lassen,
          wie sie brauchen. Wenn Sie soviele Knöpfe gedrückt haben, wie in der
          ihnen präsentierten Sequenz aufgeblinkt haben, wird automatisch zur
          nächsten Sequenz gewechselt. Zwischen den Sequenzen dürfen Sie kurz
          verschnaufen, wenn Sie möchten.
        </p>
        <p>
          Bevor der Hauptteil des Experiments beginnt, haben Sie die
          Möglichkeit, ein paar Übungsdurchgänge zu machen, um mit dem Ablauf
          vertraut zu werden.
        </p>
        <p>
          Wenn Sie Fragen zum Ablauf haben, wenden Sie sich bitte an die
          Versuchsleitung. Ansonsten drücken Sie auf Weiter, um mit den
          Übungsdurchgängen zu starten.
        </p>
      </div>
    ),
    button_label: 'Weiter',
  });

  const preSimonTrial = {
    type: SurveyHtmlFormPlugin,
    html: '',
    button_label: 'Sequenz starten',
  };

  const simonTrial = {
    type: SimonPlugin,
    config: () => {
      return {
        sequence: jsPsych.timelineVariable('sequence'),
        mode: jsPsych.timelineVariable('mode'),
      };
    },
    data: {
      relevant: true,
    },
  };

  // Practice runs
  timeline.push({
    timeline: [preSimonTrial, simonTrial],
    timeline_variables: practiceSequences,
  });

  // Pre-main instruction
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: renderToStaticMarkup(
      <div className="instruction">
        <p>
          Sehr gut. Nun beginnt der Hauptteil des Experiments, ihre Aufgabe
          bleibt aber genau die gleiche.
        </p>
        <p>
          Wenn Sie noch Fragen haben, wenden Sie sich bitte an die
          Versuchsleitung. Ansonsten können Sie mittels eines Klicks auf den
          Button starten.
        </p>
      </div>
    ),
    button_label: 'Weiter',
  });

  // Practice runs
  timeline.push({
    timeline: [preSimonTrial, simonTrial],
    timeline_variables: mainSequences,
  });

  // Goodbye
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: renderToStaticMarkup(
      <div className="instruction">
        <p>
          Vielen Dank für Ihre Teilnahme! Mit einem Klick auf den Button werden
          die Daten gespeichert.
        </p>
      </div>
    ),
    button_label: 'Weiter',
  });

  // Run the experiment
  await jsPsych.run(timeline);

  // Get the resulting data
  const resultData = jsPsych.data
    .get()
    .filter({ relevant: true })
    .filterColumns(['response', 'sequence', 'mode', 'rt']);
  // If the experiment is run by JATOS, pass the resulting data to the server
  // in CSV form.
  if (environment === 'jatos') {
    // Some editors may throw errors here if TypeScript is used, since the jatos
    // object is not created here but injected at runtime. This is why for the
    // following line, TypeScript errors are ignored.
    // @ts-ignore
    jatos.submitResultData(resultData.csv(), jatos.startNextComponent);
    resultData.localSave('csv', 'data.csv');
  }
  // In every other environment, print the data to the browser console in JSON
  // form. Here you can adjust what should happen to the data if the experiment
  // is served, e.g. by a common httpd server.
  else {
    console.log('End of experiment. Results:');
    console.log(resultData);
    resultData.localSave('csv', 'data.csv');
  }
};
