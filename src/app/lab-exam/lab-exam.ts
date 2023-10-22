import { LabItemInfo } from '../masterdata/labItem';
import { GUID } from '../share/guid';
import { Audit } from './../share/audit';
export interface LabExamInfo extends Audit {
    id: GUID;
    patientId: string;
    entryTime: Date;
    labItem: LabItemInfo;
    labValue: number;

    note: string;
}

export class LabExam implements LabExamInfo {
    id: GUID;
    patientId: string;
    entryTime: Date;
    labItem: LabItemInfo;
    labValue: number;

    note: string;

    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

}

export interface LabExamEdit extends LabExamInfo {
    labItemId: number;
}

export interface CreateLabExam {
    labItemId: number;
    labValue: number;
}

export interface LabHemosheetInfo {
    name: string;
    labItemId: number;
    onlyOnDate: boolean;

    itemName: string;
    itemIsYesNo: boolean;
}
