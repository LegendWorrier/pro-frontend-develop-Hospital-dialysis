import { BloodAccessRoute } from '../enums/blood-access-route';
import { GUID } from '../share/guid';
import { DialysisMode } from './dialysis-mode';
import { DialysisPrescriptionInfo } from './dialysis-prescription-info';
import { HdfType } from './hdf-type';

export class DialysisPrescription implements DialysisPrescriptionInfo {
    id?: GUID;
    patientId: string;
    temporary: boolean;
    mode: DialysisMode = DialysisMode.HD;
    hdfType?: HdfType;
    substituteVolume?: number;
    ivSupplementVolume?: number;
    ivSupplementPosition?: string;

    dryWeight?: number;
    excessFluidRemovalAmount?: number;
    bloodFlow?: number;
    bloodTransfusion?: number;
    extraFluid?: number;
    nss?: number;

    duration: number;
    frequency?: number;

    anticoagulant: string;
    acPerSession?: number;
    initialAmount?: number;
    maintainAmount?: number;
    reasonForRefraining: string;
    // ml (alternate unit) for heparin
    acPerSessionMl?: number; // ml/session
    initialAmountMl?: number; // ml
    maintainAmountMl?: number; // ml/Hr

    dialysateK?: number;
    dialysateCa?: number;
    hcO3?: number;
    na?: number;
    dialysateTemperature?: number;
    dialysateFlowRate?: number;

    bloodAccessRoute: BloodAccessRoute;
    aNeedleCC?: number;
    vNeedleCC?: number;
    arterialNeedle?: number;
    venousNeedle?: number;

    dialyzer: string;
    dialyzerSurfaceArea?: number;
    avgDialyzerReuse?: number;

    dialysisNurse?: GUID;

    note: string;

    created: Date;
    isActive = true;

    isHistory: boolean;

    get DurationFormatted(): string {
        return Math.trunc(this.duration / 60) + 'H ' + this.duration % 60 + 'M';
    }

    get DialysateFormatted(): string {
        if (this.dialysateK == null) {
            return null;
        }
        return this.dialysateK.toFixed(1) + '/' + this.dialysateCa.toFixed(1);
    }

    get isAcNotUsed(): boolean {
        return !(this.anticoagulant || this.acPerSession || this.acPerSessionMl || this.initialAmount || this.initialAmountMl || this.maintainAmount || this.maintainAmountMl);
    }

    updated?: Date;
    createdBy?: GUID;
    updatedBy?: GUID;
}
