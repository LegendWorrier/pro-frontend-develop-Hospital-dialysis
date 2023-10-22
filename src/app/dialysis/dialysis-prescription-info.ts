import { BloodAccessRoute } from '../enums/blood-access-route.js';
import { Audit } from '../share/audit.js';
import { GUID } from '../share/guid.js';
import { DialysisMode } from './dialysis-mode.js';
import { HdfType } from './hdf-type.js';

export interface DialysisPrescriptionInfo extends Audit {
    id?: GUID;
    patientId: string;
    temporary: boolean;
    mode: DialysisMode;
    hdfType?: HdfType;
    substituteVolume?: number;
    ivSupplementVolume?: number;
    ivSupplementPosition?: string;

    dryWeight?: number;
    excessFluidRemovalAmount?: number;
    bloodFlow?: number;
    bloodTransfusion?: number;
    extraFluid?: number;

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
    hco3?: number;
    na?: number;
    dialysateTemperature?: number;
    dialysateFlowRate?: number;

    bloodAccessRoute: BloodAccessRoute;
    aNeedleCC?: number;
    vNeedleCC?: number;
    arterialNeedle?: number;
    venousNeedle?: number;

    dialyzer: string;
    dilayzerSerfaceArea?: number;
    avgDialyzerReuse?: number;

    note: string;

    isActive: boolean;

    isHistory: boolean;
}