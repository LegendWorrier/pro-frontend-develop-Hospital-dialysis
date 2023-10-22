import { TRTMappingLab } from '../enums/trt-lab';
import { Data } from './data';

export interface LabItem extends Data {
    unit: string;
    category: LabCategory;
    isYesNo: boolean;

    trt: TRTMappingLab;

    upperLimit?: number;
    lowerLimit?: number;
    upperLimitM?: number;
    lowerLimitM?: number;
    upperLimitF?: number;
    lowerLimitF?: number;
}

export interface LabItemInfo extends LabItem {
    // -------- read only ------------
    isSystemBound: boolean;
    bound: string;

    // -------- System Only ----------
    isCalculated: boolean;
}

export enum LabCategory {
    OneMonth = 1,
    ThreeMonths = 3,
    SixMonths = 6,
    Year = 12
}


