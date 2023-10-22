import { Audit } from '../share/audit.js';
import { HemosheetInfo } from './hemosheet-info.js';

export interface HemosheetNoteInfo extends HemosheetInfo {
    note: HemoNote;
}

export interface HemoNote extends Audit {
    complication: string;
}

