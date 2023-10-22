import { GUID } from '../share/guid';
import { Audit } from '../share/audit';

export interface AvShuntIssueTreatment extends Audit {
    type: 'avIssue';
    id?: GUID;
    patientId: string;
    abnormalDatetime?: Date;
    complications?: string;
    treatmentMethod?: string;
    hospital?: string;
    treatmentResult?: string;
    cathId?: GUID;

    isActive: boolean;
}

