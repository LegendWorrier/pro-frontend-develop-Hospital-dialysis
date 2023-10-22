export namespace HemoSetting {

    export interface All {
        basic: Basic;
        rules: Rule;
    }

    export interface Basic {
        auto: string;
        delay: string;
        autoFillRecord: string;
        autoFillMedicine: boolean;
    }
    
    export interface Rule {
        changeCompleteTimePermissionRequired: boolean;
        headNurseCanApproveDoctorSignature: boolean;
        changePrescriptionSensitive: boolean;
        dialysisPrescriptionRequireHeadNurse: boolean;
    }
}


