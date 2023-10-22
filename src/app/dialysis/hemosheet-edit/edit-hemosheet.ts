import { GUID } from 'src/app/share/guid';
import { Hemosheet } from "../hemosheet"

export interface EditHemosheet extends Hemosheet {
    dialysisPrescriptionId: GUID;
}