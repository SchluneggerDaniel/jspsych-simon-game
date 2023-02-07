import { SimonConfig } from '../SimonPlugin/SimonPlugin';

export const practiceSequences: SimonConfig[] = [
  { mode: 'audiovisual', sequence: [0, 1, 0, 1] },
  { mode: 'visual', sequence: [0, 1, 1, 0] },
  { mode: 'audiovisual', sequence: [0, 1, 2, 0, 1, 2] },
  { mode: 'visual', sequence: [0, 3, 2, 1, 3, 2, 1, 0] },
];

export const mainSequences: SimonConfig[] = [
  { mode: 'audiovisual', sequence: [3, 1, 1, 2, 3, 0, 3, 1] },
  { mode: 'visual', sequence: [1, 1, 2, 0, 0, 3, 0, 0] },
  { mode: 'audiovisual', sequence: [1, 1, 0, 0, 1, 1, 3, 3] },
  { mode: 'visual', sequence: [2, 0, 0, 2, 2, 1, 1, 0] },
];
