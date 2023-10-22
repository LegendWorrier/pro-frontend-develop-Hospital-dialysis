import { FlagEnum } from 'src/app/share/flag-enum-base';
import { GUID } from 'src/app/share/guid';
import { Audit } from '../share/audit';

export interface ShiftSlot extends Audit {
    id: GUID;
    date: Date|string;
    userId: GUID;
    unitId?: number;
    shiftData: ShiftData;

    shiftMetaId?: number;
}

export enum ShiftData {
    Undefined = 0,
    Section1 = 1 << 0,
    Section2 = 1 << 1,
    Section3 = 1 << 2,
    Section4 = 1 << 3,
    Section5 = 1 << 4,
    Section6 = 1 << 5,
    Reserved = 1 << 6,
    OffLimit = 1 << 7,
}

export namespace ShiftData {
    export function hasFlag(originalValue: ShiftData, compareValue: ShiftData): boolean {
        return FlagEnum.hasFlag(originalValue, compareValue);
    }

    export function setFlag(originalValue: ShiftData, flag: ShiftData): ShiftData {
        return FlagEnum.setFlag(originalValue, flag);
    }

    export function removeFlag(originalValue: ShiftData, flag: ShiftData): ShiftData {
        return FlagEnum.removeFlag(originalValue, flag);
    }

    export function hasAnyFlag(originalValue: ShiftData, compareValue: number): boolean {
        return FlagEnum.hasAnyFlag(originalValue, compareValue, ShiftData);
    }

    export function toKeys(value: number): string[] {
        return FlagEnum.toKeys(value, ShiftData);
    }

    export function toMaps(value: number): { key: string, value: ShiftData }[] {
        return FlagEnum.toMaps(value, ShiftData);
    }

    export function toValues(value: number): number[] {
        return FlagEnum.toValues(value, ShiftData);
    }
}
