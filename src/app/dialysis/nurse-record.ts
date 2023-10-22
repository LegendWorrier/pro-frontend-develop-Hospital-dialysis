import { GUID } from 'src/app/share/guid';
import { Audit } from '../share/audit';

export interface NurseRecordInfo extends Audit {
    type: 'nurse';
    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;
    content: string;
}

export class NurseRecord implements NurseRecordInfo {
    type = 'nurse' as const;
    content: string;

    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;

}
