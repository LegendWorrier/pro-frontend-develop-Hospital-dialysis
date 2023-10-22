import { FlagEnum } from "../share/flag-enum-base";

export enum Feature
{
    None = 0,
    Management = 1 << 0,
    Integrated = 1 << 1,
}

export namespace Feature {
    export function hasFlag(originalValue: Feature, compareValue: Feature): boolean {
        return FlagEnum.hasFlag(originalValue, compareValue);
    }

    export function setFlag(originalValue: Feature, flag: Feature): Feature {
        return FlagEnum.setFlag(originalValue, flag);
    }

    export function removeFlag(originalValue: Feature, flag: Feature): Feature {
        return FlagEnum.removeFlag(originalValue, flag);
    }

    export function hasAnyFlag(originalValue: Feature, compareValue: number): boolean {
        return FlagEnum.hasAnyFlag(originalValue, compareValue, Feature);
    }

    export function toMaps(value: number): { key: string, value: Feature }[] {
        return FlagEnum.toMaps(value, Feature);
    }
}