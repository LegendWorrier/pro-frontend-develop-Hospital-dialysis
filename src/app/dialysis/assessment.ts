import { GUID } from '../share/guid';
import { AssessmentTypes } from '../enums/assessment-type.enum';
import { OptionTypes } from '../enums/option-types.enum';

export interface AssessmentGroupInfo {
    id: number;
    created?: Date;
    createdBy: GUID;
    updated?: Date;
    updatedBy?: GUID;

    type: AssessmentTypes;
    name: string;
    displayName: string;
}

export class AssessmentGroup implements AssessmentGroupInfo {
    id: number;
    created?: Date;
    createdBy: GUID;
    updated?: Date;
    updatedBy?: GUID;
    type: AssessmentTypes;
    name: string;
    displayName: string;
    
    order: number;
}

export interface AssessmentInfo {
    id: number;
    groupId?: number;
    created?: Date;
    createdBy: GUID;
    updated?: Date;
    updatedBy?: GUID;
    type?: AssessmentTypes;
    name: string;
    displayName: string;
    optionType: OptionTypes;
    multi: boolean;
    hasOther: boolean;
    hasText: boolean;
    hasNumber: boolean;

    note?: string;

    optionsList: AssessmentOptionInfo[];
}

export interface AssessmentOptionInfo {
    id?: number;
    order: number;
    name: string;
    displayName: string;

    note?: string;

    textValue?: string;
    value?: number;
}

export class Assessment implements AssessmentInfo {
    id: number;
    groupId?: number;
    created?: Date;
    createdBy: GUID;
    updated?: Date;
    updatedBy?: GUID;
    type?: AssessmentTypes;
    name: string;
    displayName: string;
    optionType: OptionTypes = OptionTypes.Checkbox;
    multi: boolean;
    hasOther: boolean;
    hasText: boolean;
    hasNumber: boolean;
    
    optionsList: AssessmentOptionInfo[] = [];

    note: string;

    order: number;
}

export interface AssessmentItem {
    id?: GUID;
    created?: Date;
    createdBy?: GUID;
    updated?: Date;
    updatedBy?: GUID;

    assessmentId: number;
    isReassessment: boolean; // no effect on dialysis assessment

    selected?: number[];
    checked?: boolean;
    text?: string;
    value?: number;
}
