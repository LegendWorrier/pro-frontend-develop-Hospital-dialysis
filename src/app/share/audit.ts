import { GUID } from './guid.js';
export interface Audit {
    createdBy?: GUID;
    updatedBy?: GUID;
    created?: Date;
    updated?: Date;
}

export interface AuditInfo {
    createdName: string;
    updatedName: string;

    createdTime: Date;
    updatedTime: Date;
}

export interface Entity extends Audit {
    id: GUID | number;
}
