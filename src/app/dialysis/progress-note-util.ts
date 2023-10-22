import { ProgressNote, ProgressNoteInfo } from './progress-note';

export function processProgressNote(item: ProgressNoteInfo): ProgressNote {
  const result: ProgressNote = Object.assign(new ProgressNote, item);
  result.aList = result.a.split('\n').map(x => ({ value: x }));
  result.iList = result.i.split('\n').map(x => ({ value: x }));
  result.eList = result.e.split('\n').map(x => ({ value: x }));

  return result;
}