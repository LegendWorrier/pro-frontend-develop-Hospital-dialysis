import { GUID } from '../share/guid';
import { Audit } from '../share/audit';

export interface AvShunt extends Audit {
    type: 'avShunt';
    id?: GUID;
    patientId: string;
    establishedDate?: Date;
    endDate?: Date;

    catheterType?: string;
    side?: string;
    shuntSite?: string;

    catheterizationInstitution?: string;

    note?: string;
    reasonForDiscontinuation?: string;

    photographs?: string[];

    isActive: boolean;
}

