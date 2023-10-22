import { ScheduleSection } from './../schedule/section';
export interface ShiftInfo {
    unitId: number; // Unit Id
    currentShift: number; // index number
    currentSection?: ScheduleSection;
    lastStarted?: Date;
    sections: ScheduleSection[];
    color?: string;
}
