import { FlagEnum } from './../share/flag-enum-base';
import { Stockable } from './stockable';

export interface Medicine extends Stockable {
    category?: string;
    usageWays: UsageWays;

    dose?: number;
}

export enum UsageWays {
    Undefined = 0,
    PO = 1 << 0, // Oral
    SL = 1 << 1, // Sublingual
    SC = 1 << 2, // Subcutaneous injection
    IV = 1 << 3, // Intravenous injection
    IM = 1 << 4, // Intramuscular injection
    IVD = 1 << 5, // Intravenous addition
    TOPI = 1 << 6, // Partially rubbed
    EXT = 1 << 7, // External use
    AC = 1 << 8, // Take before meals
    PC = 1 << 9, // Take after meals
    Meal = 1 << 10, // Taken in meal
    HOME = 1 << 11 // Patient treat him/herself at home
}

export namespace UsageWays {
    export function hasFlag(originalValue: UsageWays, compareValue: UsageWays): boolean {
        return FlagEnum.hasFlag(originalValue, compareValue);
    }

    export function setFlag(originalValue: UsageWays, flag: UsageWays): UsageWays {
        return FlagEnum.setFlag(originalValue, flag);
    }

    export function removeFlag(originalValue: UsageWays, flag: UsageWays): UsageWays {
        return FlagEnum.removeFlag(originalValue, flag);
    }

    export function hasAnyFlag(originalValue: UsageWays, compareValue: number): boolean {
        return FlagEnum.hasAnyFlag(originalValue, compareValue, UsageWays);
    }

    export function toMaps(value: number): { key: string, value: UsageWays }[] {
        return FlagEnum.toMaps(value, UsageWays);
    }
}
