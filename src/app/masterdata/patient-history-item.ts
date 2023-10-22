import { TRTMappingPatient } from "../enums/trt-patient";
import { Data } from "./data";

export interface PatienHistoryItem extends Data {
    order: number;

    isYesNo: boolean;
    isNumber: boolean;
    allowOther: boolean;

    choices: PatientChoice[];

    trt: TRTMappingPatient;
}

export interface PatientChoice {
    text: string;
    numberValue?: number;
}