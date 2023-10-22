import { LabItemInfo } from './../masterdata/labItem';
import { LabExamInfo } from './lab-exam';

export interface LabResult {
    columns: Date[];
    data: {key: LabItemInfo, value: LabExamInfo[][] }[];
}
