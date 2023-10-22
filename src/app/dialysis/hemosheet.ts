import { GUID } from 'src/app/share/guid';
import { AdmissionType } from '../enums/admission-type';
import { Postures } from '../enums/postures';
import { AvShuntRecord, BloodCollectionRecord, DehydrationRecord, DialyzerRecord, HemosheetInfo, VitalSignRecord } from './hemosheet-info';
import { DialysisPrescription } from './dialysis-prescription';
import { DialysisPrescriptionInfo } from './dialysis-prescription-info';
import { DialysisType } from '../enums/dialysis-type';


export class Hemosheet implements HemosheetInfo {
    id: GUID;
    patientId: string;
    completedTime?: Date;
    admission?: AdmissionType;
    outsideUnit: boolean;
    ward: string;
    bed: string;
    cycleStartTime: Date;
    cycleEndTime: Date;

    isICU: boolean;
    type: DialysisType;

    acNotUsed: boolean;
    reasonForRefraining: string;
    flushNSS?: number;
    flushNSSInterval?: number;
    flushTimes?: number;
    dehydration: DehydrationRecord = { abnormal: false };
    dialysisPrescription: DialysisPrescriptionInfo = new DialysisPrescription();
    preVitalsign: VitalSignRecord[] = [];
    postVitalsign: VitalSignRecord[] = [];
    dialyzer: DialyzerRecord = {};
    bloodCollection: BloodCollectionRecord = {};
    avShunt: AvShuntRecord = {};
    proofReader?: GUID;
    shiftSectionId?: number;
    doctorConsent: boolean;
    doctorId?: GUID;

    nursesInShift?: GUID[];
    sentPDF?: boolean;

    created?: Date;
    updated?: Date;
    createdBy?: GUID;
    updatedBy?: GUID;
}



