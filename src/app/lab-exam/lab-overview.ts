import { PatientInfo } from 'src/app/patients/patient-info';

export interface LabOverview {
    patient: PatientInfo;
    total: number;
    lastRecord?: Date;
}
