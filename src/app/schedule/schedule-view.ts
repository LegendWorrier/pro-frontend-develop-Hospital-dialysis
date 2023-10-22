import { Audit } from './../share/audit';
import { PatientInfo } from './../patients/patient-info';
import { ScheduleSection } from './section';
import { Schedule } from './schedule';
import { SectionSlots } from '../enums/section-slots';
export interface ScheduleView {
    unitId: number;
    sections: SectionView[];
    reschedules: Schedule[];

    patients: PatientInfo[];
}

export interface SectionView {
    section: ScheduleSection;
    slots: SlotView[];
}

export interface SlotView {
    sectionId: number;
    sectionStartTime: number;
    slot: SectionSlots;

    patientList: SlotPatientView[];
}

export interface SlotPatientView extends Audit {
    patientId: string;
}
