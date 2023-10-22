export interface IAppConfig {
    apiServer: string;
    reportService: string;
    secureDomain: string;
    centerName: string;
    centerType: 'hospital' | 'hc';
    enableHIS: boolean;
    enableTRTMap: boolean; // This is exclusively for Thailand's hospital/center

    global: GlobalSetting; // All settings that also affect server settings is defined here.

    decimalPrecision: number;

    hasReassessment: boolean;
    hideNursesInShift: boolean;

    dialysisRecord: DialysisRecordSetting;
    patient: PatientSetting;
    prescription: DialysisPrescriptionSetting;
    labExam: LabExamSetting;
    enableCosignRequest: boolean;

    timeZoneId: string;
    localLanguage: string;
    localCurrency: string;
}

export interface GlobalSetting {
    logoAlign: Align;
}

export enum Align {
    Left,
    Center,
    Right
}

export interface PatientSetting {
    useHnOnly: boolean;
}

export interface DialysisPrescriptionSetting {
    acHr: number;
    avgDialyzerReuse?: number;
}

export interface DialysisRecordSetting {
    model?: boolean;
    number?: boolean;

    remaining?: boolean;

    bps?: boolean;
    bpd?: boolean;
    hr?: boolean;
    rr?: boolean;
    temp?: boolean;
    bfr?: boolean;
    vp?: boolean;
    ap?: boolean;
    dp?: boolean;
    tmp?: boolean;
    ufRate?: boolean;
    ufTotal?: boolean;
    acLoading?: boolean;
    acMaintain?: boolean;
    hav?: boolean;
    dfrTarget?: boolean;
    dfr?: boolean;
    dialysate?: boolean;
    dtTarget?: boolean;
    dt?: boolean;
    dcTarget?: boolean;
    dc?: boolean;
    bc?: boolean;
    nss?: boolean;
    glucose50?: boolean;
    hco3?: boolean;
    naTarget?: boolean;
    naProfile?: boolean;
    ufProfile?: boolean;
    mode?: boolean;
    bfav?: boolean;
    ufTarget?: boolean;
    sRate?: boolean;
    sTotal?: boolean;
    sTarget?: boolean;
    sTemp?: boolean;
    ktv?: boolean;
    urr?: boolean;
    prr?: boolean;
    recirculationRate?: boolean;
    dbv?: boolean;
}

export interface LabExamSetting {
    defaultList: number[];
}
