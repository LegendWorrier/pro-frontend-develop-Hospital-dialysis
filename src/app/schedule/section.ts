import { Audit } from 'src/app/share/audit';
export interface ScheduleSection extends Audit {
    id?: number;
    unitId: number;
    startTime: number;

    // ==== FE Only ==========
    start?: string;
}
