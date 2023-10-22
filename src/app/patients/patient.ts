import { AdmissionType } from '../enums/admission-type';
import { CoverageSchemeType } from '../enums/coverage-scheme-type';
import { Gender } from '../enums/gender';
import { GUID } from '../share/guid';
import { DialysisInfo, EmergencyContact, PatientInfo, Tag } from './patient-info';

export enum BloodType {
    O = 1, A, B, AB, Unknown = 0
}

export enum BloodSign {
    Plus = '+',
    Negative = '-'
}

export class Patient implements PatientInfo {
    id: string;
    hospitalNumber: string;
    identityNo: string;
    name: string;
    gender: Gender;
    birthDate: Date;
    bloodType: string;
    // ====== for FE ======
    blood: BloodType;
    bloodSign: BloodSign;
    // ==========
    telephone: string;
    address: string;
    transferFrom: string;
    admission: AdmissionType;
    coverageScheme: CoverageSchemeType;
    dialysisInfo: DialysisInfo = {
        status: null,
        causeOfKidneyDisease: null
    };
    emergencyContact: EmergencyContact = {
        name: null, phoneNumber: null,
        relationship: null
    };
    note: string;
    barcode: string;
    rfid: string;
    doctorId: GUID;
    unitId: number;
    allergy: number[] = [];
    tags: Tag[] = [];

    img: string;
}
