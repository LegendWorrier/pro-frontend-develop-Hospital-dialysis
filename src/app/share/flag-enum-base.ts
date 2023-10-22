export namespace FlagEnum {
    export type FlaggedEnum<T> = {
        [id: string]: T | any;
        [nu: number]: string;
    };

    export function hasFlag<T extends number>(originalValue: T, compareValue: T): boolean {
        return (originalValue & compareValue) !== 0;
    }

    export function hasAnyFlag
    <T extends number, TypeOfT extends FlaggedEnum<T>>(originalValue: T, compareValue: number, e: TypeOfT): boolean {
        let value = compareValue;
        while (value) {
            const bit = value & (~value + 1);
            if (hasFlag(originalValue, bit)) {
                return true;
            }
            value ^= bit;
        }
        return false;
    }

    export function setFlag<T extends number>(originalValue: T, flag: T): T {
        originalValue = (originalValue | flag) as T;
        return originalValue;
    }

    export function removeFlag<T extends number>(originalValue: T, flag: T): T {
        originalValue = (originalValue & ~flag) as T;
        return originalValue;
    }

    export function toKeys<T extends number, TypeOfT extends FlaggedEnum<T>>(value: number, e: TypeOfT): string[] {
        const keys: string[] = [];
        while (value) {
            const bit = value & (~value + 1);
            keys.push(e[bit]);
            value ^= bit;
        }
        return keys;
    }

    export function toMaps<T extends number, TypeOfT extends FlaggedEnum<T>>(value: number, e: TypeOfT): { key: string, value: T }[] {
        const maps: { key: string, value: T }[] = [];
        while (value) {
            const bit = value & (~value + 1);
            maps.push({ key: e[bit], value:  bit as T });
            value ^= bit;
        }
        return maps;
    }

    export function toValues<T extends number, TypeOfT extends FlaggedEnum<T>>(value: number, e: TypeOfT): T[] {
        const values: T[] = [];
        while (value) {
            const bit = value & (~value + 1);
            values.push(bit as T);
            value ^= bit;
        }
        return values;
    }

    
}
