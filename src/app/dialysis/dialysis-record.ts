import { GUID } from 'src/app/share/guid';
import { Audit } from '../share/audit';
import { AssessmentItem } from './assessment';

export interface DialysisRecordInfo extends Audit {
    type: 'dialysis';
    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;
    remaining: number;
    model: string;
    number: string;
    bps: number;
    bpd: number;
    hr: number;
    rr: number;
    temp: number;
    bfr: number;
    vp: number;
    ap: number;
    dp: number;
    tmp: number;
    ufRate: number;
    ufTotal: number;
    acLoading: number;
    acMaintain: number;
    hav: number;
    dfrTarget: number;
    dfr: number;
    dialysate: string;
    dtTarget: number;
    dt: number;
    dcTarget: number;
    dc: number;
    bc: number;
    nss: number;
    glucose50: number;
    hco3: number;
    naTarget: number;
    naProfile: string;
    ufProfile: string;
    mode: string;
    bfav: number;
    ufTarget: number;
    sRate: number;
    sav: number;
    sTarget: number;
    sTemp: number;

    ktv: number;
    prr: number;
    urr: number;
    recirculationRate: number;
    dbv: number;

    note: string;

    isFromMachine: boolean;

    assessmentItems?: AssessmentItem[];
}

export class DialysisRecord implements DialysisRecordInfo {
    type = 'dialysis' as const;
    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

    hemodialysisId: GUID;
    id: GUID;
    timestamp: Date;
    remaining: number;
    model: string;
    number: string;
    bps: number;
    bpd: number;
    hr: number;
    rr: number;
    temp: number;
    bfr: number;
    vp: number;
    ap: number;
    dp: number;
    tmp: number;
    ufRate: number;
    ufTotal: number;
    acLoading: number;
    acMaintain: number;
    hav: number;
    dfrTarget: number;
    dfr: number;
    dialysate: string;
    dtTarget: number;
    dt: number;
    dcTarget: number;
    dc: number;
    bc: number;
    nss: number;
    glucose50: number;
    hco3: number;
    naTarget: number;
    naProfile: string;
    ufProfile: string;
    mode: string;
    bfav: number;
    ufTarget: number;
    sRate: number;
    sav: number;
    sTarget: number;
    sTemp: number;

    ktv: number;
    urr: number;
    prr: number;
    recirculationRate: number;
    dbv: number;

    note: string;

    isFromMachine: boolean;

    assessmentItems?: AssessmentItem[] = [];

}
