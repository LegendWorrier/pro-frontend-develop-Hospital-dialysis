import { GUID } from '../share/guid';
import { Audit } from '../share/audit';

export interface ProgressNoteInfo extends Audit {
    type: 'progress';
    hemodialysisId: GUID;
    id: GUID;
    order: number;
    focus: string;
    a: string;
    i: string;
    e: string;
}

export class ProgressNote implements ProgressNoteInfo {
    type = 'progress' as const
    content: string;

    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

    hemodialysisId: GUID;
    id: GUID;
    order: number;
    focus: string;
    a: string;
    i: string;
    e: string;

    aList: { value: string }[] = [];
    iList: { value: string }[] = [];
    eList: { value: string }[] = [];


    applyData() {
        this.a = this.aList.map(x => {
            return x.value.trim();
        }).join('\n').trimEnd();

        this.i = this.iList.map(x => {
            return x.value.trim();
        }).join('\n').trimEnd();

        this.e = this.eList.map(x => {
            return x.value.trim();
        }).join('\n').trimEnd();
    }
}
