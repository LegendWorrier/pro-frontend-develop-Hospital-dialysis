import { SectionSlots } from './../enums/section-slots';
import { ScheduleSection } from './section';
import { PatientInfo } from './../patients/patient-info';
import { GUID } from 'src/app/share/guid';

export interface SchedulePatient {
    id: GUID;
    patientId: string;
    patient: ScheduledPatient;
    originalSectionId: number;
    originalSlot: SectionSlots;

    date: Date;
    overrideUnitId?: number;

    originalSection: ScheduleSection;
}

export interface ScheduledPatient extends PatientInfo {
    schedule?: Date;
}
