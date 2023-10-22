import { GUID } from 'src/app/share/guid';
import { Audit } from '../share/audit';

export interface DoctorRecordInfo extends Audit {
    type: 'doctor';
    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;
    content: string;
}

export class DoctorRecord implements DoctorRecordInfo {
    type = 'doctor' as const;
    content: string;

    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;

}
