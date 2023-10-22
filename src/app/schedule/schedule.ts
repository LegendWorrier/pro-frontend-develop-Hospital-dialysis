import { GUID } from 'src/app/share/guid';
import { SectionSlots } from '../enums/section-slots';
import { Entity } from '../share/audit';

export interface Schedule extends Entity {
    id: GUID;
    patientId: string;
    sectionId: number;
    slot: SectionSlots;

    date: Date;
    overrideUnitId?: number;
    originalDate?: Date;
}
