import { DialysisType } from './../enums/dialysis-type.js';
import { GUID } from './../share/guid.js';
import { AdmissionType } from "../enums/admission-type.js";
import { Postures } from "../enums/postures.js";
import { Audit } from "../share/audit.js";
import { DialysisPrescriptionInfo } from './dialysis-prescription-info.js';

export interface HemosheetInfo extends Audit {
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

    dehydration: DehydrationRecord;
    dialysisPrescription: DialysisPrescriptionInfo;
    preVitalsign: VitalSignRecord[];
    postVitalsign: VitalSignRecord[];
    dialyzer: DialyzerRecord;
    bloodCollection: BloodCollectionRecord;
    avShunt: AvShuntRecord;

    proofReader?: GUID;
    shiftSectionId?: number;
    doctorConsent: boolean;
    doctorId?: GUID;

    nursesInShift?: GUID[];
    sentPDF?: boolean;
}

export interface DehydrationRecord {
    lastPostWeight?: number;
    checkInTime?: Date;
    preTotalWeight?: number;
    wheelchairWeight?: number;
    clothWeight?: number;
    foodDrinkWeight?: number;
    bloodTransfusion?: number;
    extraFluid?: number;
    ufGoal?: number;
    postTotalWeight?: number;
    postWheelchairWeight?: number;
    // ========== Abnormal Weight ==============
    abnormal: boolean;
    reason?: string;
}

export interface DialyzerRecord {
    useNo?: number;
    tcv?: number;
}

export interface BloodCollectionRecord {
    pre?: string;
    post?: string;
}

export interface VitalSignRecord {
    timestamp: string;
    bps?: number;
    bpd?: number;
    hr?: number;
    rr?: number;
    temp?: number;
    spO2?: number; // %
    posture?: Postures;
}

export interface AvShuntRecord {
    avShuntId?: GUID;
    shuntSite?: string;

    aSize?: number;
    vSize?: number;

    aNeedleTimes?: number;
    vNeedleTimes?: number;

    aNeedleCC?: number;
    vNeedleCC?: number;

    aLength?: number;
    vLength?: number;
}

