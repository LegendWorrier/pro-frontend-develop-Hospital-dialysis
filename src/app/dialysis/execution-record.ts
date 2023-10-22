import { UsageWays } from '../masterdata/medicine';
import { MedicinePrescriptionInfo } from '../patients/medicine-prescription';
import { Audit } from '../share/audit';
import { GUID } from '../share/guid';
import { DialysisRecordInfo } from './dialysis-record';

export interface ExecutionRecord extends Audit {
    id: GUID;
    hemodialysisId: GUID;
    timestamp: Date;
    type: ExecutionType;
    isExecuted: boolean;
    coSign: string;
}

export enum ExecutionType {
    Medicine,
    NSSFlush
}

export interface MedicineRecord extends ExecutionRecord {
    type: ExecutionType.Medicine;
    prescriptionId: GUID;
    prescription: MedicinePrescriptionInfo;

    overrideRoute?: UsageWays;
    overrideDose?: number;
}

export interface FlushRecord extends ExecutionRecord {
    type: ExecutionType.NSSFlush

    recordId: GUID;
    record?: DialysisRecordInfo;
}

export class MedicineRecordInstance implements MedicineRecord {
    type: ExecutionType.Medicine = ExecutionType.Medicine;
    prescriptionId: GUID;
    prescription: MedicinePrescriptionInfo;
    overrideRoute?: UsageWays;
    overrideDose?: number;
    id: GUID;
    hemodialysisId: GUID;
    timestamp: Date;
    isExecuted: boolean;
    coSign: string;
    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

}

export class FlushRecordInstance implements FlushRecord {
    type: ExecutionType.NSSFlush = ExecutionType.NSSFlush;
    id: GUID;
    hemodialysisId: GUID;
    recordId: GUID;
    timestamp: Date;
    isExecuted: boolean;
    coSign: string;
    createdBy?: GUID;
    updatedBy?: GUID;
    created?: Date;
    updated?: Date;
    
}


