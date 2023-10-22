import { KidneyState } from './../enums/kidney-state.js';
import { GUID } from './../share/guid.js';
import { AdmissionType } from '../enums/admission-type.js';
import { CoverageSchemeType } from '../enums/coverage-scheme-type.js';
import { Gender } from '../enums/gender.js';

export interface PatientViewInfo extends PatientInfo {
    schedule?: Date;
    isInSession?: boolean;
    totalThisMonth?: number;
}

export interface PatientInfo {
    id: string;
    hospitalNumber: string;
    identityNo: string;
    name: string;
    gender: Gender;
    birthDate: Date;
    bloodType: string;
    telephone: string;
    address: string;

    transferFrom: string;
    admission: AdmissionType;
    coverageScheme: CoverageSchemeType;

    dialysisInfo?: DialysisInfo;
    emergencyContact?: EmergencyContact;

    note: string;

    barcode: string;
    rfid: string;

    doctorId?: GUID;
    unitId: number;

    allergy?: number[];
    tags?: Tag[];
}

export interface DialysisInfo {
    accumulatedTreatmentTimes?: number;
    firstTime?: Date;
    firstTimeAtHere?: Date;
    endDateAtHere?: Date;
    kidneyTransplant?: Date;
    kidneyState?: KidneyState;
    causeOfKidneyDisease: string;
    status: string;

    timeOfDeath?: Date;
    causeOfDeath?: string;

    transferTo?: string;
}

export interface EmergencyContact {
    name: string;
    phoneNumber: string;
    relationship: string;
}

export interface Tag {
    id?: string;
    text: string;
    color: string;
    italic: boolean;
    bold: boolean;
    strikeThroughStyle?: string;
}
