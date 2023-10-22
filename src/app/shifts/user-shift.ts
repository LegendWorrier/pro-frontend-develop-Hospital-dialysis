import { GUID } from 'src/app/share/guid';
import { Audit } from '../share/audit';
import { ShiftSlot } from './shift-slot';

export interface UserShift extends UserShiftSuspend {

    shiftSlots: ShiftSlot[];
}

export interface UserShiftResult {
    unitId?: number;
    month: Date;
    users: UserShift[];
}

export interface UserShiftSuspend extends Audit {
    id?: number;
    month: Date|string;
    userId: GUID;
    suspended: boolean;
}

