import { HemosheetInfo } from "src/app/dialysis/hemosheet-info";
import { PatientInfo } from "src/app/patients/patient-info";

export interface HemoResult {
    record: HemosheetInfo;
    patient: PatientInfo;
}