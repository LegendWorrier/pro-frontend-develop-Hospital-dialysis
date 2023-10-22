import { GUID } from 'src/app/share/guid';
import { Data } from './data';

export interface Unit extends Data {
    code?: string;
    headNurse: GUID;
}
